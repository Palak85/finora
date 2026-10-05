from django.urls import path
from .views import ReportSummaryView, ExportReportCSVView, ExportReportExcelView, ExportReportPDFView

urlpatterns = [
    path('summary/', ReportSummaryView.as_view(), name='report_summary'),
    path('export/csv/', ExportReportCSVView.as_view(), name='report_export_csv'),
    path('export/excel/', ExportReportExcelView.as_view(), name='report_export_excel'),
    path('export/pdf/', ExportReportPDFView.as_view(), name='report_export_pdf'),
]
