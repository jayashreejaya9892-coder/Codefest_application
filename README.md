# OlympicLens – Smart Olympic Analytics

## Introduction

OlympicLens is a web application that helps users understand Olympic medal data in a simple and visual way. Instead of looking through large amounts of data, users can compare countries, check medal trends, and explore the performance of different sports using charts.

We are developing this project to learn how data analytics and visualization can be used to present information in an easy-to-understand format.

## Objectives

- To display Olympic medal data in a clear and simple way.
- To compare the medal performance of different countries.
- To understand how medal counts change across Olympic Games.
- To show medal distribution across different sports.
- To explore a basic method of estimating future medal performance.

## Technologies Used

- **HTML:** Used to create the structure of the website.
- **CSS:** Used to design the dashboard and make it look attractive.
- **JavaScript:** Used to read the data, apply filters, and update the charts.
- **Chart.js:** Used to create interactive charts.
- **CSV:** Used to store the Olympic medalist data.

## Features

### 1. Country Comparison
Users can compare the total medals recorded for different countries.

### 2. Performance Over Time
This chart helps users explore how a country's medal performance changes across different Olympic editions.

### 3. Sport-wise Performance
Users can view the distribution of medals across different sports.

### 4. Filters
Users can select an Olympic edition, country, or sport to explore a particular part of the dataset.

### 5. Medal Estimate
The application displays a simple baseline estimate based on a country's latest available Olympic results. It is only a basic estimate and is not a trained machine-learning prediction.

## How to Run the Project

1. Download or copy the project files to your computer.
2. Open the `OlympicLens_MVP` folder in Visual Studio Code.
3. Make sure the CSV file is saved inside the `data` folder.
4. Check that the filename matches the path used in `app.js`.
5. Install the Live Server extension in VS Code if required.
6. Right-click `index.html` and select **Open with Live Server**.
7. The website will open in your browser, where you can explore the dashboard.

## Dataset

The project uses a CSV file containing Olympic medalist records. JavaScript reads the file and processes the records before displaying the information in the dashboard.

Since the dataset is community-compiled, the medal totals should be checked against official Olympic results before being treated as final or verified statistics. Team events and tied medals also need careful handling to avoid inaccurate totals.

## Limitations

- The accuracy of the results depends on the dataset.
- Some medal counts may require further verification.
- The current estimate is a simple baseline and not a machine-learning model.
- The project is still being developed, so some features and visualizations may be improved.

## Future Scope

In the future, we plan to improve the accuracy of the medal counts, verify the data using official sources, improve the dashboard design, and add more useful comparisons. We may also develop a prediction model if we can obtain enough reliable historical data.

## Conclusion

OlympicLens is our attempt to make Olympic data easier to explore through a web application. Working on this project helps us understand the basics of data collection, data processing, visualization, and web development. We hope to improve it further as we learn more about these technologies.
