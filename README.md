# SimRail Station Watcher

SimRail Station Watcher is a React application built with Vite and Material-UI (MUI) that allows users to monitor and manage train stations in the SimRail railway simulator. It provides a user-friendly interface to view station information and receive notifications when stations become free for dispatching. This open-source project aims to enhance the SimRail experience by providing a convenient tool for train dispatchers.

## Features

- Real-time station data: Fetches and displays real-time information about train stations based on selected servers.
- Station availability notifications: Notifies users when watched stations become available for dispatching.
- Watched stations management: Allows users to add or remove stations from their watched list for easy monitoring.
- Favorite stations: Enables users to mark specific stations as favorites for quick access.
- Server selection: Allows users to select the desired server to retrieve station data.
- Refresh interval customization: Lets users define the interval for refreshing station data.
- Integration with SimRail Live Map: Provides a direct link to the live map of the selected server for better situational awareness.

The application settings are stored in the browser's local storage, allowing users to persist their preferences across sessions.

## Demo

You can try the live demo of SimRail Station Watcher hosted on [watcher.simrail.data-unknown.eu](https://watcher.simrail.data-unknown.eu/) by [Vercel](https://vercel.com/).

## Installation

To install and run SimRail Station Watcher locally, follow these steps:

1. Clone the repository:

   ```shell
   git clone https://github.com/GNimrodG/simrail-station-watcher.git
   ```

2. Navigate to the project directory:

   ```shell
   cd simrail-station-watcher
   ```

3. Install the dependencies using [Yarn](https://yarnpkg.com/):

   ```shell
   yarn install
   ```

4. Start the development server:

   ```shell
   yarn dev
   ```

   This will launch the application in development mode and open it in your default browser. Changes to the source code will automatically trigger hot-reloading.

## Dependencies

The main dependencies used in this project are:

- [React](https://reactjs.org): A JavaScript library for building user interfaces.
- [Vite](https://vitejs.dev): A fast development server and build tool for modern web applications.
- [Material-UI (MUI)](https://mui.com): A popular React UI framework that provides pre-designed components and styles.

## Contributors

- [GNimrodG](https://github.com/GNimrodG) - Author and maintainer

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

SimRail Station Watcher is inspired by the SimRail railway simulator and aims to enhance the experience of train dispatchers. Thanks to the SimRail community for their support and feedback.

Please note that this project is not officially affiliated with or endorsed by SimRail or its developers.
