# SampleCan - Dashboard (NodeJS & ElectronJS)

<!-- ABOUT THE PROJECT -->
## About The Project

**SampleCan Dashboard** is a lightweight desktop application built with **Node.js** and **Electron.js** for managing and viewing mission data.  
It provides a user-friendly interface for adding, editing, and managing missions with a simple and intuitive dashboard.


<!-- TABLE OF CONTENTS -->
### Contents

- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Compiling](#compiling)


### Built With

- [![NodeJS](https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white)](https://nodejs.org)
- [![ElectronJS](https://img.shields.io/badge/-electron-F1C40F?style=for-the-badge&labelColor=17202A&logo=electron&logoColor=61DBFB)](https://www.electronjs.org/)
- [![Lucide](https://img.shields.io/badge/Lucide-f56565?style=for-the-badge)](https://lucide.dev/)


<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* `nodeJs`
* `npm`
* `git`

### Installation

1. Clone the repository

```bash
git clone https://github.com/0kibob/sti2d.ldv-cansat.git
cd app
```

2. Install dependencies:

```bash
npm install
```

### Use (Development / Debug)

Start the app:
```bash
npm run .
```

<!-- COMPILING -->
## Compiling

To build a distributable Electron application:

```bash
npm run make
```

This will create an executable installer in the `dist/` directory for your platform.