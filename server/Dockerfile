# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
# Path is relative to the build context (server/)
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# Use --no-cache-dir to reduce image size
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend application code (from the server/ context) into the container at /app
COPY . .

# Make port 5001 available to the world outside this container
EXPOSE 5001

# Define environment variable for the port (optional, but good practice)
ENV PORT=5001

# Run app.py when the container launches using gunicorn with eventlet
# Use --worker-class eventlet for SocketIO compatibility
# Use -w 1 for a single worker (adjust if needed, but start simple)
# Use --bind 0.0.0.0:$PORT to bind to all interfaces on the specified port
# Use app:app to specify the Flask application instance
CMD ["gunicorn", "--worker-class", "eventlet", "-w", "1", "--bind", "0.0.0.0:5001", "app:app"]
