from django_filters import rest_framework as filters
from .models import Job, Course

class JobsFilter(filters.FilterSet):

  keyword = filters.CharFilter(field_name="title", lookup_expr="icontains")
  location = filters.CharFilter(field_name="address", lookup_expr="icontains")
  min_salary = filters.NumberFilter(field_name="salary" or 0, lookup_expr="gte")
  max_salary = filters.NumberFilter(field_name="salary" or 1000000, lookup_expr="lte")

  class Meta:
    model = Job
    fields = ("keyword", "location", "education", "jobType", "experience", "min_salary", "max_salary")

class CourseFilter(filters.FilterSet):
    keyword = filters.CharFilter(field_name='title', lookup_expr='icontains')
    level = filters.CharFilter(field_name='level', lookup_expr='exact')
    industry = filters.CharFilter(field_name='industry', lookup_expr='exact')

    class Meta:
        model = Course
        fields = ('keyword', 'level', 'industry')