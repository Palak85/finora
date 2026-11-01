import csv
from io import BytesIO
from decimal import Decimal
from datetime import datetime
from django.http import HttpResponse
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from apps.accounts.models import Account
from apps.transactions.models import Transaction
from apps.budgets.models import Budget
from apps.investments.models import Investment
from apps.analytics.utils import calculate_total_balance, calculate_monthly_income, calculate_monthly_expenses

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

User = get_user_model()


def get_target_users_scope(request):
    """
    Returns the queryset of users whose records should be exported.
    - If user is Admin/Superuser without user_id param -> all non-admin users (platform overview).
    - If user is Admin/Superuser with user_id param -> that specific user.
    - If user is Advisor with user_id param -> that specific user.
    - Otherwise -> request.user.
    """
    user = request.user
    target_user_id = request.query_params.get('user_id')
    if user.role == 'ADMINISTRATOR' or user.is_superuser:
        if target_user_id:
            return User.objects.filter(id=target_user_id)
        return User.objects.exclude(role='ADMINISTRATOR')
    elif user.role == 'FINANCIAL_ADVISOR' and target_user_id:
        return User.objects.filter(id=target_user_id)
    return User.objects.filter(id=user.id)


class ReportSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        users_scope = get_target_users_scope(request)
        txns = Transaction.objects.filter(user__in=users_scope)
        accounts = Account.objects.filter(user__in=users_scope)
        budgets = Budget.objects.filter(user__in=users_scope)
        investments = Investment.objects.filter(user__in=users_scope)

        return Response({
            'success': True,
            'data': {
                'total_transactions': txns.count(),
                'total_accounts': accounts.count(),
                'total_budgets': budgets.count(),
                'total_investments': investments.count(),
                'available_reports': [
                    {'id': 'monthly_financial', 'name': 'Monthly Financial Report', 'formats': ['pdf', 'csv', 'excel']},
                    {'id': 'expense', 'name': 'Expense Report', 'formats': ['pdf', 'csv', 'excel']},
                    {'id': 'budget', 'name': 'Budget Adherence Report', 'formats': ['pdf', 'csv', 'excel']},
                    {'id': 'investment', 'name': 'Investment Portfolio Report', 'formats': ['pdf', 'csv', 'excel']},
                    {'id': 'net_worth', 'name': 'Net Worth Report', 'formats': ['pdf', 'csv', 'excel']},
                ]
            }
        })


from .authentication import QueryParamOrHeaderJWTAuthentication

class ExportReportCSVView(APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        report_type = request.query_params.get('type', 'monthly_financial')
        users_scope = get_target_users_scope(request)
        
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="finora_{report_type}_report.csv"'

        writer = csv.writer(response)

        if report_type == 'expense':
            writer.writerow(['Date', 'Reference ID', 'User', 'Category', 'Payment Method', 'Description', 'Amount (INR)'])
            txns = Transaction.objects.filter(user__in=users_scope, transaction_type='EXPENSE').select_related('user').order_by('-transaction_date')
            for t in txns:
                writer.writerow([t.transaction_date, t.reference_id, t.user.full_name, t.category, t.payment_method, t.description, t.amount])

        elif report_type == 'investment':
            writer.writerow(['Asset Name', 'User', 'Type', 'Quantity', 'Avg Buy Price', 'Invested Amount', 'Current Value', 'P&L', 'P&L %'])
            invs = Investment.objects.filter(user__in=users_scope).select_related('user')
            for i in invs:
                writer.writerow([i.asset_name, i.user.full_name, i.asset_type, i.quantity, i.average_buy_price, i.invested_amount, i.current_value, i.profit_loss, i.profit_loss_percentage])

        elif report_type == 'budget':
            writer.writerow(['Category', 'User', 'Month/Year', 'Monthly Limit', 'Spent Amount', 'Status'])
            budgets = Budget.objects.filter(user__in=users_scope).select_related('user')
            for b in budgets:
                writer.writerow([b.category, b.user.full_name, f"{b.month}/{b.year}", b.monthly_limit, b.spent_amount, 'SAFE'])

        else: # monthly_financial or net_worth
            writer.writerow(['Date', 'Reference ID', 'User', 'Type', 'Category', 'Description', 'Amount (INR)'])
            txns = Transaction.objects.filter(user__in=users_scope).select_related('user').order_by('-transaction_date')
            for t in txns:
                writer.writerow([t.transaction_date, t.reference_id, t.user.full_name, t.transaction_type, t.category, t.description, t.amount])

        return response


class ExportReportExcelView(APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        report_type = request.query_params.get('type', 'monthly_financial')
        users_scope = get_target_users_scope(request)

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Finora Report"

        header_font = Font(name='Arial', size=11, bold=True, color='F5F1E6')
        header_fill = PatternFill(start_color='0B0B0A', end_color='0B0B0A', fill_type='solid')
        gold_border = Side(style='thin', color='D4AF37')
        border_all = Border(left=gold_border, right=gold_border, top=gold_border, bottom=gold_border)

        if report_type == 'expense':
            headers = ['Date', 'Reference ID', 'User', 'Category', 'Payment Method', 'Description', 'Amount (INR)']
            ws.append(headers)
            txns = Transaction.objects.filter(user__in=users_scope, transaction_type='EXPENSE').select_related('user').order_by('-transaction_date')
            for t in txns:
                ws.append([str(t.transaction_date), t.reference_id, t.user.full_name, t.category, t.payment_method, t.description, float(t.amount)])

        elif report_type == 'investment':
            headers = ['Asset Name', 'User', 'Type', 'Quantity', 'Avg Buy Price', 'Invested Amount', 'Current Value', 'P&L', 'P&L %']
            ws.append(headers)
            invs = Investment.objects.filter(user__in=users_scope).select_related('user')
            for i in invs:
                ws.append([i.asset_name, i.user.full_name, i.asset_type, float(i.quantity), float(i.average_buy_price), float(i.invested_amount), float(i.current_value), float(i.profit_loss), float(i.profit_loss_percentage)])

        elif report_type == 'budget':
            headers = ['Category', 'User', 'Month/Year', 'Monthly Limit', 'Spent Amount', 'Status']
            ws.append(headers)
            budgets = Budget.objects.filter(user__in=users_scope).select_related('user')
            for b in budgets:
                ws.append([b.category, b.user.full_name, f"{b.month}/{b.year}", float(b.monthly_limit), float(b.spent_amount), 'SAFE'])

        else:
            headers = ['Date', 'Reference ID', 'User', 'Type', 'Category', 'Description', 'Amount (INR)']
            ws.append(headers)
            txns = Transaction.objects.filter(user__in=users_scope).select_related('user').order_by('-transaction_date')
            for t in txns:
                ws.append([str(t.transaction_date), t.reference_id, t.user.full_name, t.transaction_type, t.category, t.description, float(t.amount)])

        for cell in ws[1]:
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal='center', vertical='center')

        for col in ws.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = col[0].column_letter
            ws.column_dimensions[col_letter].width = max(max_len + 3, 12)

        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)

        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="finora_{report_type}_report.xlsx"'
        return response


class ExportReportPDFView(APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        report_type = request.query_params.get('type', 'monthly_financial')
        users_scope = get_target_users_scope(request)
        user = request.user
        
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
        elements = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=20,
            textColor=colors.HexColor('#D4AF37'),
            spaceAfter=10
        )
        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            textColor=colors.HexColor('#555555'),
            spaceAfter=16
        )

        elements.append(Paragraph("FINORA BANKING & PERSONAL FINANCE", title_style))
        elements.append(Paragraph(
            f"Official Statement: {report_type.replace('_', ' ').title()} Report | Generated for {user.full_name} ({user.email})",
            subtitle_style
        ))
        elements.append(Spacer(1, 10))

        txns = Transaction.objects.filter(user__in=users_scope).select_related('user').order_by('-transaction_date')[:35]
        data = [["Date", "User", "Type", "Category", "Description", "Amount (INR)"]]

        for t in txns:
            data.append([
                str(t.transaction_date),
                t.user.full_name[:12],
                t.transaction_type,
                t.category,
                t.description[:20],
                f"₹{t.amount}"
            ])

        t_table = Table(data, colWidths=[70, 75, 65, 80, 160, 90])
        t_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0B0B0A')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#D4AF37')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 9),
            ('BOTTOMPADDING', (0,0), (-1,0), 8),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F8F9FA')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ]))

        elements.append(t_table)
        doc.build(elements)

        pdf = buffer.getvalue()
        buffer.close()

        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="finora_{report_type}_report.pdf"'
        return response
