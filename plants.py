from flask import Flask, render_template
app = Flask(__name__)

posts = [
    {
        'author': 'hannah',
        'title': 'plants app practise 1',
    },
        {
        'author': 'hannah',
        'title': 'plants app practise 2',
    }

]


@app.route('/')
@app.route('/home')
def home():
    return render_template('home.html', posts=posts)

@app.route('/login')
def login():
    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)