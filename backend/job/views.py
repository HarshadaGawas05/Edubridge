from django.shortcuts import render
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg, Min, Max, Count
import json

from .models import CandidatesApplied, Job, Course, CourseEnrollment, CourseContent, ContentProgress
from .serializers import CandidatesAppliedSerializer, CourseSerializer, CourseEnrollmentSerializer, CourseWithContentSerializer

from rest_framework.permissions import IsAuthenticated

from .serializers import JobSerializer
from .models import Job

from django.shortcuts import get_object_or_404
from .filters import JobsFilter, CourseFilter
from rest_framework.pagination import PageNumberPagination

# Create your views here.

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getCurrentUserJobs(request):
    try:
        jobs = Job.objects.filter(user=request.user).order_by('-createdAt')
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)
    except Exception as e:
        print(f"Error getting user jobs: {str(e)}")  # Debug log
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def getAllJobs(request):
    try:
        jobs = Job.objects.all().order_by('-createdAt')
        
        # Handle filtering
        filterset = JobsFilter(request.GET, queryset=jobs)
        jobs = filterset.qs

        serializer = JobSerializer(jobs, many=True)
        
        return Response({
            'count': len(jobs),
            'resPerPage': 10,
            'jobs': serializer.data
        })
    except Exception as e:
        print(f"Error in getAllJobs: {str(e)}")  # Debug log
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def getJob(request, pk):
    job = get_object_or_404(Job, id=pk)

    candidates = job.candidatesapplied_set.all().count()

    serializer = JobSerializer(job, many=False)

    return Response({"job": serializer.data, "candidates": candidates})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def newJob(request):
    request.data['user'] = request.user
    data = request.data

    job = Job.objects.create(**data)

    serializer = JobSerializer(job, many=False)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateJob(request, pk):
    job = get_object_or_404(Job, id=pk)

    if job.user != request.user:
        return Response({ 'message': 'You cannot update this job' }, status=status.HTTP_403_FORBIDDEN)

    job.title = request.data['title']
    job.description = request.data['description']
    job.email = request.data['email']
    job.address = request.data['address']
    job.jobType = request.data['jobType']
    job.education = request.data['education']
    job.industry = request.data['industry']
    job.experience = request.data['experience']
    job.salary = request.data['salary']
    job.positions = request.data['positions']
    job.company = request.data['company']

    job.save()

    serializer = JobSerializer(job, many=False)

    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteJob(request, pk):
    job = get_object_or_404(Job, id=pk)

    if job.user != request.user:
        return Response({ 'message': 'You cannot delete this job' }, status=status.HTTP_403_FORBIDDEN)

    job.delete()

    return Response({ 'message': 'Job is Deleted.' }, status=status.HTTP_200_OK)


@api_view(['GET'])
def getTopicStats(request, topic):

    args = { 'title__icontains': topic }
    jobs = Job.objects.filter(**args)

    if len(jobs) == 0:
        return Response({ 'message': 'Not stats found for {topic}'.format(topic=topic) })

    
    stats = jobs.aggregate(
        total_jobs = Count('title'),
        avg_positions = Avg('positions'),
        avg_salary = Avg('salary'),
        min_salary = Min('salary'),
        max_salary = Max('salary')
    )

    return Response(stats)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def applyToJob(request, pk):

    user = request.user
    job = get_object_or_404(Job, id=pk)

    if user.userprofile.resume == '':
        return Response({ 'error': 'Please upload your resume first' }, status=status.HTTP_400_BAD_REQUEST)

    if job.lastDate < timezone.now():
        return Response({ 'error': 'You can not apply to this job. Date is over' }, status=status.HTTP_400_BAD_REQUEST)

    alreadyApplied = job.candidatesapplied_set.filter(user=user).exists()

    if alreadyApplied:
        return Response({ 'error': 'You have already apply to this job.' }, status=status.HTTP_400_BAD_REQUEST)


    jobApplied = CandidatesApplied.objects.create(
        job = job,
        user = user,
        resume = user.userprofile.resume
    )

    return Response({
        'applied': True,
        'job_id': jobApplied.id
    },
    status=status.HTTP_200_OK
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getCurrentUserAppliedJobs(request):
    try:
        args = {'user_id': request.user.id}
        jobs = CandidatesApplied.objects.filter(user=request.user).order_by('-appliedAt')
        serializer = CandidatesAppliedSerializer(jobs, many=True)
        return Response(serializer.data)
    except Exception as e:
        print(f"Error getting applied jobs: {str(e)}")  # Debug log
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def isApplied(request, pk):

    user = request.user
    job = get_object_or_404(Job, id=pk)

    applied = job.candidatesapplied_set.filter(user=user).exists()

    return Response(applied)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getCandidatesApplied(request, pk):

    user = request.user
    job = get_object_or_404(Job, id=pk)

    if job.user != user:
        return Response({ 'error': 'You can not acces this job' }, status=status.HTTP_403_FORBIDDEN)

    candidates = job.candidatesapplied_set.all()

    serializer = CandidatesAppliedSerializer(candidates, many=True)

    return Response(serializer.data)

@api_view(['GET'])
def getAllCourses(request):
    try:
        courses = Course.objects.select_related('user').all().order_by('-createdAt')
        
        # Add debug logging
        for course in courses:
            print(f"Course: {course.title}")
            print(f"Course User ID: {course.user.id if course.user else 'None'}")
            
        serializer = CourseSerializer(courses, many=True)
        serialized_data = serializer.data
        
        # Debug serialized data
        print("Serialized Data:", serialized_data)
        
        return Response({
            'count': len(courses),
            'resPerPage': 10,
            'courses': serialized_data
        })
    except Exception as e:
        print(f"Error in getAllCourses: {str(e)}")  # Debug log
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def getCourse(request, pk):
    try:
        course = Course.objects.prefetch_related('contents').get(id=pk)
        enrolled_count = CourseEnrollment.objects.filter(course=course).count()
        
        serializer = CourseSerializer(course)
        return Response({
            'course': serializer.data,
            'enrolled_count': enrolled_count
        })
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enrollCourse(request, pk):
    try:
        user = request.user
        course = get_object_or_404(Course, id=pk)
        
        # Check if already enrolled
        if CourseEnrollment.objects.filter(user=user, course=course).exists():
            return Response(
                {'error': 'You are already enrolled in this course'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create enrollment
        enrollment = CourseEnrollment.objects.create(
            user=user,
            course=course,
            progress=0,
            completed=False
        )
        
        # Create initial content progress
        for content in course.contents.all():
            ContentProgress.objects.create(
                enrollment=enrollment,
                content=content,
                completed=False,
                watched_duration=0,
                progress=0
            )
        
        return Response({
            'enrolled': True,
            'enrollment_id': enrollment.id
        })
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getCurrentUserCourses(request):
    try:
        enrollments = CourseEnrollment.objects.filter(
            user=request.user
        ).select_related('course')
        
        serializer = CourseEnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)
    except Exception as e:
        print(f"Error getting user courses: {str(e)}")  # Debug log
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def newCourse(request):
    try:
        data = request.data.copy()
        video_url = data.pop('video_url', None)
        thumbnail = request.FILES.get('thumbnail')
        skills = data.pop('skills', '[]')
        
        # Convert skills string to list if it's a string
        if isinstance(skills, str):
            skills = json.loads(skills)
        
        # Create course instance
        course = Course.objects.create(
            title=data.get('title'),
            description=data.get('description'),
            instructor=data.get('instructor'),
            level=data.get('level'),
            industry=data.get('industry'),
            skills=skills,
            duration_weeks=data.get('duration_weeks'),
            user=request.user  # Directly assign the user instance
        )
        
        # Handle thumbnail if present
        if thumbnail:
            course.thumbnail = thumbnail
            course.save()
        
        # Handle video content if provided
        if video_url:
            CourseContent.objects.create(
                course=course,
                title=f"Module 1: Introduction to {course.title}",
                video_url=video_url,
                duration_minutes=30,
                order=1
            )
        
        # Return the serialized course data
        serializer = CourseSerializer(course)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        print(f"Error creating course: {str(e)}")  # Debug log
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateCourse(request, pk):
    course = get_object_or_404(Course, id=pk)
    
    if course.user != request.user:
        return Response(
            {'message': 'You cannot update this course'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    course.title = request.data['title']
    course.description = request.data['description']
    course.instructor = request.data['instructor']
    course.level = request.data['level']
    course.industry = request.data['industry']
    course.skills = request.data['skills']
    course.duration_weeks = request.data['duration_weeks']
    
    course.save()
    serializer = CourseSerializer(course, many=False)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteCourse(request, pk):
    try:
        course = get_object_or_404(Course, id=pk)
        
        # Check if user owns the course
        if course.user != request.user:
            return Response(
                {'error': 'You do not have permission to delete this course'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        course.delete()
        return Response(
            {'message': 'Course deleted successfully'},
            status=status.HTTP_200_OK
        )
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def content_progress(request, course_id, content_id):
    try:
        # Get required objects
        course = get_object_or_404(Course, id=course_id)
        content = get_object_or_404(CourseContent, id=content_id, course=course)
        
        # Check if user is enrolled
        enrollment = CourseEnrollment.objects.filter(
            user=request.user,
            course=course
        ).first()
        
        if not enrollment:
            return Response(
                {'error': 'You must be enrolled in this course'},
                status=status.HTTP_403_FORBIDDEN
            )

        if request.method == 'GET':
            progress = ContentProgress.objects.filter(
                enrollment=enrollment,
                content=content
            ).first()
            
            if not progress:
                return Response({
                    'watched_duration': 0,
                    'last_position': 0,
                    'progress': 0,
                    'completed': False,
                    'course_progress': enrollment.progress
                })
            
            return Response({
                'watched_duration': progress.watched_duration,
                'last_position': progress.last_position,
                'progress': progress.progress,
                'completed': progress.completed,
                'course_progress': enrollment.progress
            })

        # POST request - update progress
        progress, _ = ContentProgress.objects.get_or_create(
            enrollment=enrollment,
            content=content
        )
        
        # Update progress
        progress.watched_duration = float(request.data.get('watched_duration', 0))
        progress.last_position = float(request.data.get('last_position', 0))
        progress.progress = int(request.data.get('progress', 0))
        # Mark as completed if progress is 50% or more
        progress.completed = request.data.get('completed', False) or progress.progress >= 50
        progress.save()
        
        # Update overall course progress
        total_contents = course.contents.count()
        if total_contents > 0:
            # Calculate progress based on content progress
            all_content_progress = ContentProgress.objects.filter(
                enrollment=enrollment
            ).values_list('progress', flat=True)
            
            # Average progress across all content
            total_progress = sum(all_content_progress) / total_contents
            course_progress = int(total_progress)
            
            # Update enrollment progress
            enrollment.progress = course_progress
            enrollment.completed = course_progress >= 90
            if enrollment.completed and not enrollment.completedAt:
                enrollment.completedAt = timezone.now()
            enrollment.save()
        
        return Response({
            'progress': progress.progress,
            'course_progress': enrollment.progress,
            'watched_duration': progress.watched_duration,
            'last_position': progress.last_position,
            'completed': progress.completed
        })
        
    except Exception as e:
        print(f"Error in content_progress: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getCourseProgress(request, pk):
    try:
        course = get_object_or_404(Course, id=pk)
        enrollment = get_object_or_404(
            CourseEnrollment,
            user=request.user,
            course=course
        )
        
        content_progress = ContentProgress.objects.filter(
            enrollment=enrollment
        )
        
        progress_data = {
            'overall_progress': enrollment.progress,
            'completed': enrollment.completed,
            'content_progress': {
                cp.content.id: {
                    'progress': cp.progress,
                    'completed': cp.completed,
                    'watched_duration': cp.watched_duration
                } for cp in content_progress
            }
        }
        
        return Response(progress_data)
    except CourseEnrollment.DoesNotExist:
        return Response(
            {'error': 'Not enrolled in this course'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def updateContentProgress(request, course_id, content_id):
    try:
        enrollment = CourseEnrollment.objects.get(
            course_id=course_id,
            user=request.user
        )
        content = CourseContent.objects.get(id=content_id, course_id=course_id)
        
        progress_data = request.data
        content_progress, created = ContentProgress.objects.get_or_create(
            enrollment=enrollment,
            content=content,
            defaults={
                'watched_duration': progress_data.get('watched_duration', 0),
                'progress': progress_data.get('progress', 0),
                'completed': progress_data.get('completed', False)
            }
        )
        
        if not created:
            content_progress.watched_duration = progress_data.get('watched_duration', content_progress.watched_duration)
            content_progress.progress = progress_data.get('progress', content_progress.progress)
            content_progress.completed = progress_data.get('completed', content_progress.completed)
            content_progress.save()
            
        # Update overall course progress
        total_content = enrollment.course.contents.count()
        completed_content = ContentProgress.objects.filter(
            enrollment=enrollment,
            completed=True
        ).count()
        
        if total_content > 0:
            overall_progress = (completed_content / total_content) * 100
            enrollment.progress = overall_progress
            enrollment.completed = completed_content == total_content
            if enrollment.completed and not enrollment.completedAt:
                enrollment.completedAt = timezone.now()
            enrollment.save()
            
        return Response({
            'progress': content_progress.progress,
            'completed': content_progress.completed,
            'overall_progress': round(overall_progress) if total_content > 0 else 0
        })
        
    except (CourseEnrollment.DoesNotExist, CourseContent.DoesNotExist) as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def checkEnrollment(request, pk):
    try:
        course = get_object_or_404(Course, id=pk)
        is_enrolled = CourseEnrollment.objects.filter(
            user=request.user,
            course=course
        ).exists()
        
        # Get progress if enrolled
        progress = 0
        if is_enrolled:
            enrollment = CourseEnrollment.objects.get(
                user=request.user,
                course=course
            )
            progress = enrollment.progress
        
        return Response({
            'isEnrolled': is_enrolled,
            'progress': progress
        })
    except Exception as e:
        print(f"Error checking enrollment: {str(e)}")  # Debug log
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getJobRecommendations(request):
    try:
        # Get user's skills from completed courses
        user_enrollments = CourseEnrollment.objects.filter(
            user=request.user,
            completed=True
        ).prefetch_related('skills_acquired')
        
        user_skills = set()
        for enrollment in user_enrollments:
            user_skills.update(enrollment.skills_acquired.all())
        
        # Find jobs matching user's skills
        matching_jobs = Job.objects.filter(
            skills_required__in=user_skills,
            lastDate__gte=timezone.now()
        ).distinct()
        
        # Sort jobs by skill match percentage
        job_matches = []
        for job in matching_jobs:
            required_skills = set(job.skills_required.all())
            match_percentage = len(user_skills.intersection(required_skills)) / len(required_skills) * 100
            job_matches.append({
                'job': job,
                'match_percentage': match_percentage
            })
        
        # Sort by match percentage
        job_matches.sort(key=lambda x: x['match_percentage'], reverse=True)
        
        # Serialize and return
        serializer = JobSerializer([m['job'] for m in job_matches], many=True)
        return Response({
            'jobs': serializer.data,
            'match_percentages': [m['match_percentage'] for m in job_matches]
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )