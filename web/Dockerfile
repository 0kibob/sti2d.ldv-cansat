FROM python:3.13.9

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY src/ .

CMD ["waitress-serve", "--host=0.0.0.0", "--port=5000", "main:app"]