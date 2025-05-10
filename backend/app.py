from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
import pytz
import random
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Configure CORS to allow requests from your frontend
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",  # Local development
            "https://*.vercel.app",   # Vercel deployments
            "https://*.netlify.app",  # Netlify deployments
            os.getenv("FRONTEND_URL", "")  # Custom frontend URL
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///typing_speed.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')  # Change this in production
db = SQLAlchemy(app)

# Define the User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    scores = db.relationship('Score', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# Define the Score model
class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    wpm = db.Column(db.Float, nullable=False)
    accuracy = db.Column(db.Float, nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(pytz.timezone('Asia/Kolkata')))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Create the database tables
with app.app_context():
    db.create_all()

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        print(f"Auth header: {auth_header}")  # Debug log
        
        if auth_header:
            try:
                # Handle both "Bearer token" and raw token formats
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
                else:
                    token = auth_header
                
                print(f"Extracted token: {token}")  # Debug log
                data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
                print(f"Decoded token data: {data}")  # Debug log
                
                current_user = User.query.get(data['user_id'])
                if not current_user:
                    print("User not found for token")  # Debug log
                    return jsonify({'message': 'Invalid token!'}), 401
                    
            except Exception as e:
                print(f"Token validation error: {str(e)}")  # Debug log
                return jsonify({'message': 'Invalid token!'}), 401
        else:
            print("No Authorization header found")  # Debug log
            return jsonify({'message': 'Token is missing!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400
    
    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    
    token = jwt.encode({'user_id': user.id}, app.config['SECRET_KEY'])
    return jsonify({
        'message': 'User created successfully',
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        print(f"Login attempt with data: {data}")  # Debug log
        
        # Determine if the input is an email or username
        identifier = data.get('email') or data.get('username')
        if not identifier:
            return jsonify({'message': 'Email or username is required'}), 400
        
        # Check if identifier looks like an email
        is_email = '@' in identifier
        
        # Query user based on identifier type
        if is_email:
            user = User.query.filter_by(email=identifier).first()
        else:
            user = User.query.filter_by(username=identifier).first()
        
        if not user:
            print(f"User not found for: {identifier}")  # Debug log
            return jsonify({'message': 'Invalid credentials'}), 401
        
        if not user.check_password(data['password']):
            print("Password check failed")  # Debug log
            return jsonify({'message': 'Invalid credentials'}), 401
        
        token = jwt.encode({'user_id': user.id}, app.config['SECRET_KEY'])
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
    except Exception as e:
        print(f"Login error: {str(e)}")  # Debug log
        return jsonify({'message': 'An error occurred during login'}), 500

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email
    })

@app.route('/api/scores', methods=['POST'])
@token_required
def add_score(current_user):
    data = request.json
    new_score = Score(
        wpm=data['wpm'],
        accuracy=data['accuracy'],
        duration=data['duration'],
        user_id=current_user.id
    )
    db.session.add(new_score)
    db.session.commit()
    return jsonify({'message': 'Score added successfully'}), 201

@app.route('/api/scores', methods=['GET'])
@token_required
def get_scores(current_user):
    try:
        print(f"Fetching scores for user: {current_user.username}")  # Debug log
        scores = Score.query.join(User).order_by(Score.timestamp.desc()).all()
        ist = pytz.timezone('Asia/Kolkata')
        return jsonify([{
            'id': score.id,
            'wpm': score.wpm,
            'accuracy': score.accuracy,
            'duration': score.duration,
            'timestamp': score.timestamp.astimezone(ist).isoformat(),
            'username': score.user.username
        } for score in scores])
    except Exception as e:
        print(f"Error fetching scores: {str(e)}")  # Debug log
        return jsonify({'message': 'Error fetching scores'}), 500

# Sample texts for typing test
TYPING_TEXTS = [
    """The field of computer science has evolved dramatically over the past few decades, transforming the way we live and work. From the early days of punch cards and mainframe computers to today's cloud computing and artificial intelligence, the journey has been nothing short of revolutionary. Programming languages have become more sophisticated, allowing developers to create complex applications with relative ease. The rise of open-source software has fostered collaboration and innovation across the globe, while the internet has connected billions of people and devices. Machine learning and artificial intelligence are now capable of performing tasks that were once thought to be exclusively human, from recognizing images to translating languages in real-time. Cybersecurity has become increasingly important as our reliance on digital systems grows, with new threats emerging every day. The future of computing promises even more exciting developments, from quantum computing to brain-computer interfaces. As technology continues to advance, it's crucial that we consider both the benefits and potential challenges of these innovations.""",
    
    """The history of the internet is a fascinating tale of innovation and collaboration. What began as a military project in the 1960s has grown into a global network that connects billions of people. The World Wide Web, created by Tim Berners-Lee in 1989, revolutionized how we access and share information. Today, we can stream high-definition video, conduct virtual meetings, and access vast amounts of knowledge with just a few clicks. Social media platforms have transformed how we communicate and build communities, while e-commerce has changed the way we shop and do business. Cloud computing has made it possible to store and process massive amounts of data without expensive hardware. The Internet of Things connects everyday devices to the internet, creating smart homes and cities. As we look to the future, technologies like 5G and edge computing promise even faster and more reliable connections. However, this digital revolution also brings challenges, from privacy concerns to the digital divide. It's essential that we work to ensure the internet remains open, secure, and accessible to all.""",
    
    """Artificial Intelligence represents one of the most significant technological advances of our time. From simple rule-based systems to complex neural networks, AI has evolved to perform tasks that were once thought to be exclusively human. Machine learning algorithms can now recognize patterns in data, make predictions, and even create art. Deep learning has enabled breakthroughs in computer vision, natural language processing, and robotics. AI systems can diagnose diseases, drive cars, and translate languages in real-time. However, this rapid advancement also raises important ethical questions. We must consider issues of bias, privacy, and the potential impact on employment. The development of artificial general intelligence, while still theoretical, could fundamentally change our relationship with technology. As we continue to push the boundaries of what's possible, it's crucial that we develop AI systems that are transparent, fair, and aligned with human values. The future of AI holds both incredible promise and significant challenges that we must navigate carefully.""",
    
    """The world of software development has undergone a remarkable transformation in recent years. Modern development practices emphasize collaboration, automation, and continuous improvement. Agile methodologies have replaced traditional waterfall approaches, allowing teams to respond quickly to changing requirements. Version control systems like Git have revolutionized how developers work together, while containerization and microservices have made applications more scalable and maintainable. The rise of DevOps has blurred the lines between development and operations, leading to faster deployment cycles and more reliable systems. Cloud platforms have made it easier than ever to build and deploy applications, with services ranging from simple hosting to complex machine learning APIs. Open-source software has become the foundation of modern development, with communities working together to create powerful tools and frameworks. As technology continues to evolve, developers must stay current with new languages, frameworks, and best practices. The future of software development promises even more exciting innovations, from quantum computing to augmented reality applications."""
]

@app.route('/api/text', methods=['GET'])
def get_text():
    # Get a random text from the collection
    random_text = random.choice(TYPING_TEXTS)
    return jsonify({
        'text': random_text,
        'source': 'SwiftType'
    })

# Debug endpoint to check users (remove in production)
@app.route('/api/debug/users', methods=['GET'])
def debug_users():
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'username': user.username,
        'email': user.email
    } for user in users])

if __name__ == '__main__':
    app.run(debug=True) 