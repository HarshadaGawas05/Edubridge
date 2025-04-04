from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import boto3
import uuid
from django.conf import settings

from django.shortcuts import render
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.hashers import make_password

from .validators import validate_file_extension
from .serializers import SignUpSerializer, UserSerializer

from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User

# Create your views here.

@api_view(['POST'])
def register(request):
    data = request.data

    user = SignUpSerializer(data=data)

    if user.is_valid():
        if not User.objects.filter(username=data['email']).exists():
           user = User.objects.create(
               first_name = data["first_name"],
               last_name = data["last_name"],
               username = data["email"],
               email = data["email"],
               password = make_password(data["password"])
           ) 

           return Response({
                "message": "User registered."},
                status=status.HTTP_200_OK
            )
        else:
            return Response({
                "error": "User already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

    else:
        return Response(user.errors)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def currentUser(request):

    user = UserSerializer(request.user)

    return Response(user.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateUser(request):
    user = request.user


    data = request.data

    user.first_name = data['first_name']
    user.last_name = data['last_name']
    user.username = data['email']
    user.email = data['email']

    if data['password'] != '':
        user.password = make_password(data['password'])

    user.save()

    serializer = UserSerializer(user, many=False)
    return Response(serializer.data)


s3 = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_S3_REGION_NAME
)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def uploadResume(request):

    user = request.user
    resume = request.FILES.get("resume")

    if not resume:
        return Response({ 'error': 'Please upload your resume.' }, status=status.HTTP_400_BAD_REQUEST)
    
    isValidFile = validate_file_extension(resume.name)

    if not isValidFile:
        return Response({ 'error': 'Please upload only pdf file.' }, status=status.HTTP_400_BAD_REQUEST)

    # Debugging log to check the file details
    print(f"Uploading file: {resume.name}, size: {resume.size}")

    # Generate a unique file name using UUID
    file_name = f"{uuid.uuid4().hex}_{resume.name}"

    try:
        # Upload the file to S3
        s3.upload_fileobj(resume, settings.AWS_STORAGE_BUCKET_NAME, file_name)
        print(f"File uploaded to S3 at: {file_name}")
        
        # Store the file URL or update user profile with the resume path
        file_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{file_name}"
        user.userprofile.resume = file_url
        user.userprofile.save()

        return Response({'message': 'Resume uploaded successfully!', 'file_url': file_url}, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error uploading file: {str(e)}")
        return Response({'error': f"Error uploading file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)