# SampleCan - Web Server (Flask & Waitress)

<!-- ABOUT THE PROJECT -->
## About The Project

**SampleCan Web Server** is a simple **Flask**-based web application deployed with **Waitress** used to present and showcase the SampleCan project. Its primary purpose is to display static or lightly dynamic content related to the project, such as documentation, explanations, and visuals.


<!-- TABLE OF CONTENTS -->
### Contents

- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Deployment](#deployment)


### Built With

- [![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
- [![Flask](https://img.shields.io/badge/Flask-11FF00?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/en/stable/)
- [![Waitress](https://img.shields.io/badge/Waitress-FF69B4?style=for-the-badge)](https://pypi.org/project/waitress/)


<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* `python 3.12+`
* `pip`
* `git`
* `docker`

### Installation

1. Clone the repository

```bash
git clone https://github.com/0kibob/sti2d.ldv-cansat.git
cd web
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

### Use (Development / Debug)

Simply run the main.py file.
```bash
python src/main.py
```

The server will be available at:
`http://127.0.0.1:80`


<!-- DEPLOYMENT -->
## Deployment

### Docker

Build the deployment image for Docker:

```bash
docker build --tag samplecan-web-server .
```

Deploy the container:

```bash
docker run --name samplecan-web-server -d -p 5000:80 samplecan-web-server
```