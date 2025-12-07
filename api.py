#!/usr/bin/env python3
"""
DevPath AI REST API
Flask tabanlı REST API endpoint'leri
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import statistics
from datetime import datetime

# DevPath AI modüllerini import et
from scripts.analyze_results import TestAnalyzer
from scripts.create_learning_path import LearningPathGenerator
from scripts.generate_test_questions import QuestionGenerator

# Flask uygulaması oluştur
app = Flask(__name__)
CORS(app)  # CORS desteği

# API Dokümantasyonu endpoint'i
@app.route('/docs', methods=['GET'])
def api_docs():
    """API dokümantasyonu"""
    docs = {
        "title": "DevPath AI REST API",
        "version": "1.0.0",
        "base_url": "http://localhost:5000",
        "endpoints": [
            {
                "method": "GET",
                "path": "/health",
                "description": "API sağlık kontrolü",
                "response": {
                    "status": "healthy",
                    "timestamp": "ISO format",
                    "version": "1.0.0"
                }
            },
            {
                "method": "GET",
                "path": "/api/questions",
                "description": "Test soruları alma",
                "query_params": {
                    "category": "beginner, intermediate, advanced, all (varsayılan: all)",
                    "limit": "Maksimum soru sayısı (varsayılan: 30)"
                },
                "example": "GET /api/questions?category=beginner&limit=10"
            },
            {
                "method": "POST",
                "path": "/api/analyze",
                "description": "Test sonuçları analizi",
                "body": {
                    "user_id": "string (zorunlu)",
                    "name": "string",
                    "test_answers": [
                        {
                            "question_id": "integer",
                            "selected": "integer (0-3)"
                        }
                    ]
                },
                "example": {
                    "user_id": "user_123",
                    "name": "Ahmet Yılmaz",
                    "test_answers": [
                        {"question_id": 1, "selected": 0},
                        {"question_id": 2, "selected": 1}
                    ]
                }
            },
            {
                "method": "GET",
                "path": "/api/videos/<user_id>",
                "description": "Seviyeye uygun video önerileri",
                "query_params": {
                    "limit": "Maksimum video sayısı (varsayılan: 10)",
                    "language": "tr, en, all (varsayılan: tr)"
                },
                "example": "GET /api/videos/user_123?limit=10&language=tr"
            },
            {
                "method": "POST",
                "path": "/api/learning-path/<user_id>",
                "description": "Kişiselleştirilmiş öğrenme yolu oluşturma",
                "body": {
                    "preferences": "object",
                    "learning_profile": "object"
                }
            },
            {
                "method": "GET",
                "path": "/api/user/<user_id>/progress",
                "description": "Kullanıcı ilerleme raporu"
            },
            {
                "method": "GET",
                "path": "/api/user/<user_id>/detailed-report",
                "description": "Detaylı analiz raporu"
            },
            {
                "method": "GET",
                "path": "/api/curriculum",
                "description": "Java müfredatını alma"
            }
        ]
    }
    return jsonify(docs)

# Konfigürasyon yükleme
def load_config():
    """Yapılandırma dosyasını yükle"""
    config_path = os.path.join(os.path.dirname(__file__), 'config', 'settings.yaml')
    try:
        import yaml
        with open(config_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    except:
        return {
            'server': {
                'backend': {'port': 5000}
            }
        }

config = load_config()

# Global analyzer instance
analyzer = TestAnalyzer()
learning_path_gen = LearningPathGenerator()

@app.route('/health', methods=['GET'])
def health_check():
    """API sağlık kontrolü"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/questions', methods=['GET'])
def get_questions():
    """Test soruları alma endpoint'i"""
    try:
        # Query parametreleri
        category = request.args.get('category', 'all')  # beginner, intermediate, advanced, all
        limit = int(request.args.get('limit', 30))

        # Soru üreticisini başlat
        question_gen = QuestionGenerator()

        if category == 'all':
            questions = question_gen.get_random_questions(limit)
        else:
            questions = question_gen.get_questions_by_category(category, limit)

        return jsonify({
            'success': True,
            'data': {
                'questions': questions,
                'total': len(questions),
                'category': category
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_test_results():
    """Test sonuçları analizi endpoint'i"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'error': 'JSON veri gerekli'
            }), 400

        # Gerekli alanları kontrol et
        user_id = data.get('user_id')
        name = data.get('name')
        test_answers = data.get('test_answers', [])

        if not user_id or not test_answers:
            return jsonify({
                'success': False,
                'error': 'user_id ve test_answers gerekli'
            }), 400

        # Test sonuçlarını işle
        processed_results = analyzer.process_test_answers(user_id, name, test_answers)

        # Analiz yap
        analysis = analyzer.analyze_user(user_id)

        if not analysis:
            return jsonify({
                'success': False,
                'error': 'Analiz yapılamadı'
            }), 500

        # Raporu kaydet
        analyzer.save_report(user_id)

        # Analiz sonuçlarını endpoint üzerinden döndür
        return jsonify({
            'success': True,
            'data': analysis
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/videos/<user_id>', methods=['GET'])
def get_video_recommendations(user_id):
    """
    Kullanıcının test sonuçlarına göre seviyeye uygun video önerileri
    
    Query parametreleri:
    - limit: Maksimum video sayısı (varsayılan: 10)
    - language: Dil tercihi - tr, en, all (varsayılan: tr)
    """
    try:
        # Query parametreleri
        limit = int(request.args.get('limit', 10))
        language = request.args.get('language', 'tr')
        
        # Kullanıcının test sonuçları var mı kontrol et
        if user_id not in analyzer.results:
            return jsonify({
                'success': False,
                'error': f'Kullanıcı {user_id} için test sonuçları bulunamadı. Önce test tamamlayın.'
            }), 404
        
        # Video önerilerini al
        videos = analyzer.get_video_recommendations(user_id, limit=limit, language=language)
        
        # Kullanıcı seviyesini belirle
        user_data = analyzer.results[user_id]
        user_level = analyzer.determine_user_level(user_data)
        
        # Kullanıcı bilgilerini al
        topic_scores = user_data.get('topic_scores', {})
        avg_score = statistics.mean(list(topic_scores.values())) if topic_scores else 0
        
        user_info = {
            'user_id': user_id,
            'name': user_data.get('name', 'Bilinmeyen'),
            'level': user_level,
            'weak_topics_count': len(user_data.get('weak_topics', [])),
            'average_score': round(avg_score, 1)
        }
        
        return jsonify({
            'success': True,
            'data': {
                'user_info': user_info,
                'videos': videos,
                'total': len(videos),
                'source': 'api',
                'recommendation_based_on': f'Seviye: {user_level}, Zayıf konular: {user_info["weak_topics_count"]}'
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/learning-path/<user_id>', methods=['POST'])
def create_learning_path(user_id):
    """Kişiselleştirilmiş öğrenme yolu oluşturma"""
    try:
        data = request.get_json() or {}

        # Kullanıcı tercihleri
        user_preferences = data.get('preferences', {})
        learning_profile = data.get('learning_profile', {})

        # Öğrenme yolu oluştur
        user_scores = analyzer.get_user_topic_scores(user_id)

        if not user_scores:
            return jsonify({
                'success': False,
                'error': f'Kullanıcı {user_id} için test sonuçları bulunamadı'
            }), 404

        learning_path = learning_path_gen.generate_path(
            user_scores,
            user_preferences,
            learning_profile
        )

        return jsonify({
            'success': True,
            'data': learning_path
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/user/<user_id>/progress', methods=['GET'])
def get_user_progress(user_id):
    """Kullanıcı ilerleme raporu"""
    try:
        # Kullanıcı analizini al
        analysis = analyzer.analyze_user(user_id)

        if not analysis:
            return jsonify({
                'success': False,
                'error': f'Kullanıcı {user_id} bulunamadı'
            }), 404

        # İlerleme özeti
        progress_summary = {
            'user_id': user_id,
            'name': analysis.get('name', 'Bilinmeyen'),
            'overall_performance': analysis.get('overall_performance', {}),
            'strengths_count': len(analysis.get('strengths_weaknesses', {}).get('strengths', [])),
            'weaknesses_count': len(analysis.get('strengths_weaknesses', {}).get('weaknesses', [])),
            'recommendations_count': len(analysis.get('recommendations', [])),
            'last_analysis': analysis.get('analysis_date')
        }

        return jsonify({
            'success': True,
            'data': progress_summary
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/user/<user_id>/detailed-report', methods=['GET'])
def get_detailed_report(user_id):
    """Detaylı analiz raporu"""
    try:
        analysis = analyzer.analyze_user(user_id)

        if not analysis:
            return jsonify({
                'success': False,
                'error': f'Kullanıcı {user_id} bulunamadı'
            }), 404

        # Text raporunu da oluştur
        text_report = analyzer.format_text_report(analysis)

        return jsonify({
            'success': True,
            'data': {
                'json_report': analysis,
                'text_report': text_report
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/curriculum', methods=['GET'])
def get_curriculum():
    """Java müfredatını alma"""
    try:
        with open('data/java_curriculum.json', 'r', encoding='utf-8') as f:
            curriculum = json.load(f)

        return jsonify({
            'success': True,
            'data': curriculum
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint bulunamadı'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Sunucu hatası'
    }), 500

if __name__ == '__main__':
    port = config.get('server', {}).get('backend', {}).get('port', 5000)
    debug = config.get('app', {}).get('debug', True)

    print(f"🚀 DevPath AI API başlatılıyor - Port: {port}")
    print(f"📹 Video önerileri endpoint: GET /api/videos/<user_id>")
    print(f"📚 API Dokümantasyonu: http://localhost:{port}/docs")
    print(f"❤️  Health Check: http://localhost:{port}/health")
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
