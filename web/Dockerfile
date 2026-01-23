FROM python:3.12-slim

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ .

CMD ["waitress-serve", "--host=0.0.0.0", "--port=80", "main:app"]