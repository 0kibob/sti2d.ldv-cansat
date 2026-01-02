# SampleCan - Web Server (Flask)

## Contents

* [Introduction](#introduction)
* [Development](#developement)
* [Deployments](#deployments)

## Introduction

**SampleCan Web Server** is a simple **Flask**-based web application used to present and showcase the SampleCan project. Its primary purpose is to display static or lightly dynamic content related to the project, such as documentation, explanations, and visuals.

## Development
#### Prerequisites:
* `python 3.10+`
* `pip`
* `git`
* `docker`

#### Setup:
1. Clone the repository
```bash
git clone https://github.com/0kibob/sti2d.ldv-cansat.git
cd web/src
```
2. Install dependencies:
```bash
pip install -r requirements.txt
```

#### Run (Development / Debug):
Simply run the server.py file.
```bash
python main.py
```
The server will be available at:
```bash
http://127.0.0.1:5000
```

## Deployments

#### Docker
Build image:
```bash
docker build --tag samplecan-web-server .
```

Run container:
```bash
docker run -d -p 5000:5000 samplecan-web-server
```