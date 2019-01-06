import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'electron_project.settings'
django.setup()

from django.db.models import Sum

from expenses.models import *

import json
import datetime
import questionary as q
import webbrowser as b

from subprocess import call

from table import ConsoleTable as Table


class ExpenseHandler(object):
    
    def __init__(self):
        print(Expense.objects.count())
        self.aggregate_names()
        self.initial_prompt()
        
    def aggregate_names(self):
        
        names = [
            category.name for category in ExpenseCategory.objects.all()
        ]
        
        with open('names.json', 'w', encoding='utf-8') as f:
            f.write(json.dumps(names, ensure_ascii=False))
    
    def initial_prompt(self):
        
        ans = q.select(
            'What do you want to do?',
            choices=[
                'Filter by date range',
                'Filter by name'
            ]
        ).ask()
        
        if ans == 'Filter by date range':
            self.filter_by_date()
        
        elif ans == 'Filter by name':
            self.filter_by_name()
            
    def filter_by_date(self):
        
        index = int(q.text('Name').ask())
        From = q.text('From').ask()
        to = q.text('To').ask()
        
        self.name = self._translate_name_by_index(index)
        
        From = datetime.datetime.strptime(From, '%d%m%y').date()
        to = datetime.datetime.strptime(to, '%d%m%y').date()
        
        expenses = ExpenseCategory.objects.get(name=self.name).expenses.filter(
            date__range=(From, to)
        )
        
        self.total = expenses.aggregate(total=Sum('balance_change'))['total']
        
        headers = ['Index', 'Description', 'Balance Change', 'Date']
        
        rows = [
            (expense.description, expense.balance_change, expense.date)
            for expense in expenses
        ]
        
        self.render(headers, rows)
        
        self.initial_prompt()
        
    def _translate_name_by_index(self, index):
        
        with open('names.json', encoding='utf-8') as f:
            names = json.loads(f.read())
            
        return names[index]
        
    def filter_by_name(self):
        
        pass
    
    def render(self, headers, rows):
        
        table = '''
            <html>
                <head>
                    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

                    <script type="text/javascript" src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>

                    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
                    
                    <style>
                        
                        th, td {{
                            text-align: center
                        }}
                        
                    </style>
                    
                </head>
            
                <body>
                    <div class='container'>
                        <h1 style='text-align: center; margin-bottom: 10px'>النوع: {}</h1>
                        <h1 style='text-align: center; margin-bottom: 20px'>الاجمالى: {}</h1>
                        <table class='table table-bordered'><thead>
        
        '''.format(
            self.name,
            self.total
        )
        
        for header in headers:
            table += '<th>{}</th>'.format(header)
            
        table += '</thead><tbody>'
        
        for index, row in enumerate(rows, 1):
            table += '<tr><td>{}</td>'.format(index)
            
            for item in row:
                table += '<td>{}</td>'.format(item)
                
            table += '</tr>'
            
        table += '</tbody></table></div></body></html>'
        
        with open('output.html', 'w', encoding='utf-8') as f:
            f.write(table)
            
        b.open('output.html')
        

if __name__ == '__main__':
    
    ExpenseHandler()
