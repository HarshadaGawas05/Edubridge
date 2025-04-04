from django.db import migrations, models
import django.db.models.deletion
from django.contrib.gis.db import models as gismodels
from django.contrib.gis.geos import Point
from django.conf import settings

class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('job', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Job',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200, null=True)),
                ('description', models.TextField(null=True)),
                ('email', models.EmailField(max_length=254, null=True)),
                ('address', models.CharField(max_length=100, null=True)),
                ('jobType', models.CharField(choices=[('Permanent', 'Permanent'), ('Temporary', 'Temporary'), ('Intership', 'Intership')], default='Permanent', max_length=10)),
                ('education', models.CharField(choices=[('Bachelors', 'Bachelors'), ('Masters', 'Masters'), ('Phd', 'Phd')], default='Bachelors', max_length=10)),
                ('industry', models.CharField(choices=[('Business', 'Business'), ('Information Technology', 'IT'), ('Banking', 'Banking'), ('Education/Training', 'Education'), ('Telecommunication', 'Telecommunication'), ('Others', 'Others')], default='Business', max_length=30)),
                ('experience', models.CharField(choices=[('No Experience', 'No Experience'), ('1 Years', 'One Year'), ('2 Years', 'Two Year'), ('3 Years above', 'Three Year Plus')], default='No Experience', max_length=20)),
                ('salary', models.IntegerField(default=1)),
                ('positions', models.IntegerField(default=1)),
                ('company', models.CharField(max_length=100, null=True)),
                ('point', gismodels.PointField(default=Point(0.0, 0.0), srid=4326)),
                ('lastDate', models.DateTimeField(auto_now_add=True)),
                ('createdAt', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'job_job',
            },
        ),
        migrations.CreateModel(
            name='CandidatesApplied',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('resume', models.CharField(max_length=200)),
                ('appliedAt', models.DateTimeField(auto_now_add=True)),
                ('job', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='job.job')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'job_candidatesapplied',
            },
        ),
    ] 