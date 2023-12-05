// Define the container where the tables will be appended
const container = document.getElementById('attendance-table-container');
const classDays = [6, 1, 2, 3, 4]; // 1 for Monday, 2 for Tuesday, etc.

// Function to get the day of the week from a date
function getDayOfWeek(dateString) {
  const date = new Date(dateString + 'T00:00:00Z'); // Set to UTC to avoid timezone issues
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return dayNames[date.getUTCDay()];
}

// Function to get the week number from a date
function getWeekNumber(date, startDate) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffInTime = date.getTime() - startDate.getTime();
  const diffInDays = Math.floor(diffInTime / msPerDay);
  return Math.floor(diffInDays / 7) + 1;
}

// Function to check if there's data for a specific week
function isDataForWeek(startDate, attendanceData) {
  let hasData = false;
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDate = new Date(
      startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000
    );
    const dayOfWeek = currentDate.getUTCDay();

    // Check if the day is one of the class days
    if (classDays.includes(dayOfWeek)) {
      const dateString = currentDate.toISOString().split('T')[0];
      if (attendanceData[dateString]) {
        hasData = true;
        break;
      }
    }
  }
  return hasData;
}

// Function to generate the detailed attendance table
function generateAttendanceTable(attendanceData, startDate, endDate) {
  const table = document.createElement('table');
  table.border = '1';

  // Create table headers for weeks
  const weekHeaderRow = document.createElement('tr');
  weekHeaderRow.appendChild(document.createElement('th')); // Empty cell for the first column

  // Create table headers for days
  const dayHeaderRow = document.createElement('tr');
  dayHeaderRow.appendChild(document.createElement('th')); // Empty cell for the first column

  let currentWeekNumber = 1;
  for (let week = 1; week <= getWeekNumber(endDate, startDate); week++) {
    const weekStartDate = new Date(
      startDate.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000
    );

    if (!isDataForWeek(weekStartDate, attendanceData)) {
      continue;
    }

    // Add week header
    const weekHeader = document.createElement('th');
    weekHeader.colSpan = 5; // Span 5 columns for each week
    weekHeader.textContent = `Week ${currentWeekNumber}`;
    weekHeaderRow.appendChild(weekHeader);

    for (let day = 0; day < 5; day++) {
      const currentDate = new Date(
        weekStartDate.getTime() + day * 24 * 60 * 60 * 1000
      );
      const dateString = currentDate.toISOString().split('T')[0];
      const dayOfWeek = getDayOfWeek(dateString);

      const dateHeader = document.createElement('th');
      dateHeader.textContent = `${dayOfWeek} (${dateString})`;
      dayHeaderRow.appendChild(dateHeader);
    }

    currentWeekNumber++;
  }

  table.appendChild(weekHeaderRow);
  table.appendChild(dayHeaderRow);

  // Create attendance rows
  let allNames = new Set();
  Object.keys(attendanceData).forEach((dateString) => {
    attendanceData[dateString]?.forEach((name) => allNames.add(name));
  });
  allNames = [...allNames];

  allNames.forEach((name) => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = name;
    row.appendChild(nameCell);

    currentWeekNumber = 1;
    for (let week = 1; week <= getWeekNumber(endDate, startDate); week++) {
      const weekStartDate = new Date(
        startDate.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000
      );

      if (!isDataForWeek(weekStartDate, attendanceData)) {
        continue;
      }

      for (let day = 0; day < 5; day++) {
        const currentDate = new Date(
          weekStartDate.getTime() + day * 24 * 60 * 60 * 1000
        );
        const dateString = currentDate.toISOString().split('T')[0];

        const attendanceCell = document.createElement('td');
        attendanceCell.textContent = attendanceData[dateString]?.includes(name)
          ? '1'
          : '';
        row.appendChild(attendanceCell);
      }

      currentWeekNumber++;
    }

    table.appendChild(row);
  });

  return table;
}

// Function to calculate weekly attendance for a student
function calculateWeeklyAttendance(
  studentName,
  weekNumber,
  attendanceData,
  startDate
) {
  let attendanceCount = 0;
  Object.keys(attendanceData).forEach((dateString) => {
    const date = new Date(dateString + 'T00:00:00Z');
    if (getWeekNumber(date, startDate) === weekNumber) {
      if (attendanceData[dateString].includes(studentName)) {
        attendanceCount++;
      }
    }
  });
  return attendanceCount;
}

// Function to generate the attendance summary table
function generateAttendanceSummaryTable(attendanceData, startDate, endDate) {
  const summaryTable = document.createElement('table');
  summaryTable.border = '1';

  const totalWeeks = getWeekNumber(endDate, startDate);

  // Create header row
  const headerRow = document.createElement('tr');
  const nameHeader = document.createElement('th');
  nameHeader.textContent = 'Student Name';
  headerRow.appendChild(nameHeader);

  let currentWeekNumber = 1;
  for (let week = 1; week <= totalWeeks; week++) {
    const weekStartDate = new Date(
      startDate.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000
    );

    if (!isDataForWeek(weekStartDate, attendanceData)) {
      continue;
    }

    const weekHeader = document.createElement('th');
    weekHeader.textContent = `Week ${currentWeekNumber}`;
    headerRow.appendChild(weekHeader);

    currentWeekNumber++;
  }

  summaryTable.appendChild(headerRow);

  // Collect all names
  let allNames = new Set();
  Object.values(attendanceData).forEach((attendanceList) => {
    attendanceList.forEach((name) => allNames.add(name));
  });
  allNames = [...allNames];

  // Fill attendance summary for each student
  allNames.forEach((name) => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = name;
    row.appendChild(nameCell);

    currentWeekNumber = 1;
    for (let week = 1; week <= totalWeeks; week++) {
      const weekStartDate = new Date(
        startDate.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000
      );

      if (!isDataForWeek(weekStartDate, attendanceData)) {
        continue;
      }

      const weekCell = document.createElement('td');
      const attendanceCount = calculateWeeklyAttendance(
        name,
        week,
        attendanceData,
        startDate
      );
      weekCell.textContent = `${attendanceCount} of 5`;
      row.appendChild(weekCell);

      currentWeekNumber++;
    }

    summaryTable.appendChild(row);
  });

  return summaryTable;
}

// Main function to generate and display tables
function displayAttendanceTables(attendanceData) {
  const dates = Object.keys(attendanceData).map(
    (d) => new Date(d + 'T00:00:00Z')
  );
  dates.sort((a, b) => a - b);
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  // Generate the detailed attendance table
  const attendanceTable = generateAttendanceTable(
    attendanceData,
    startDate,
    endDate
  );
  container.appendChild(attendanceTable);

  // Generate the attendance summary table
  const attendanceSummaryTable = generateAttendanceSummaryTable(
    attendanceData,
    startDate,
    endDate
  );
  container.appendChild(attendanceSummaryTable);
}

// Fetch attendance data from the JSON file and display tables
fetch('attendance_data.json')
  .then((response) => response.json())
  .then((data) => {
    displayAttendanceTables(data);
  })
  .catch((error) => {
    console.error('Error fetching data:', error);
  });
