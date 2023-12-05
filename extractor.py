import os
import re
import json

# Function to extract attendee names from a transcript text file
def extract_attendees(text):
    attendees_match = re.search(r'Attendees\n(.+?)\n', text, re.DOTALL)
    if attendees_match:
        attendees_list = attendees_match.group(1).split(', ')
        # Exclude names with "Presentation" at the end
        attendees_list = [name for name in attendees_list if not name.endswith(" Presentation")]
        return attendees_list
    else:
        return []

# Function to extract date from a transcript filename
def extract_date_from_filename(filename):
    date_match = re.search(r'(\d{4}-\d{2}-\d{2})', filename)
    if date_match:
        return date_match.group(1)
    else:
        return None

# Function to process a transcript text file and extract attendance data
def process_transcript(text_filename):
    try:
        with open(text_filename, 'r') as file:
            text_content = file.read()
        
        attendance_data = extract_attendees(text_content)
        
        return attendance_data
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return []

# Folder path where your transcript text files are stored
folder_path = './transcripts'

# List of transcript file names (assuming all files in the folder are transcripts)
transcript_files = [os.path.join(folder_path, filename) for filename in os.listdir(folder_path) if filename.endswith(".txt")]

# Create a dictionary to store attendance data with date as the key
attendance_dict = {}

# Process each transcript and store attendance data in a dictionary by date
for transcript_file in transcript_files:
    attendance_data = process_transcript(transcript_file)
    if attendance_data:
        date = extract_date_from_filename(os.path.basename(transcript_file))
        if date:
            if date not in attendance_dict:
                attendance_dict[date] = []
            attendance_dict[date].extend(attendance_data)

# Save the attendance data to a JSON file
with open("attendance_data.json", "w") as json_file:
    json.dump(attendance_dict, json_file)

print("Attendance data extracted and saved to 'attendance_data.json' organized by date.")
