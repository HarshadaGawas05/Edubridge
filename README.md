# Edubridge - Bridging Gap Between Education and Poverty

Edubridge is a comprehensive web application that connects learners with relevant courses and job opportunities. The platform features an intelligent job recommendation system that matches courses with suitable job positions based on various criteria including skills, industry, and job titles.

## Features

### Course Management
- Create and manage educational courses
- Course enrollment and progress tracking
- Video content management
- Course completion tracking
- Skill-based course categorization

### Job Matching System
- Intelligent job recommendations based on:
  - Course titles and variations
  - Industry matching
  - Skill matching
  - Word variation matching (e.g., "painting" matches with "painter")
- Job application tracking
- Job posting and management

### User Features
- User authentication and authorization
- Course enrollment and progress tracking
- Job application management
- Personalized job recommendations
- Resume management

## Technical Stack

### Backend
- Django REST Framework
- PostgreSQL Database
- Django ORM
- RESTful API architecture

### Frontend
- Next.js
- React
- Modern UI/UX design

## Getting Started

### Prerequisites
- Python 3.x
- Node.js
- PostgreSQL
- pip (Python package manager)
- npm (Node package manager)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/HarshadaGawas05/edubridge.git
cd edubridge
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

3. Set up the frontend:
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create a `.env` file in the backend directory with the following variables:
```
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
GEOCODER_API=your_geocoder_api_key
```

## API Endpoints

### Courses
- `GET /api/courses/` - List all courses
- `POST /api/courses/` - Create a new course
- `GET /api/courses/<id>/` - Get course details
- `PUT /api/courses/<id>/` - Update course
- `DELETE /api/courses/<id>/` - Delete course

### Jobs
- `GET /api/jobs/` - List all jobs
- `POST /api/jobs/` - Create a new job
- `GET /api/jobs/<id>/` - Get job details
- `PUT /api/jobs/<id>/` - Update job
- `DELETE /api/jobs/<id>/` - Delete job

### User Management
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/auth/user/` - Get user details

## Job Matching Algorithm

The platform uses a sophisticated matching algorithm that considers:
1. Exact title matches
2. Partial title matches
3. Word variations 
4. Industry matching
5. Skill matching
6. Keyword matching

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Django REST Framework team
- Next.js team
- All contributors and maintainers 
