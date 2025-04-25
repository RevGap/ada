# app.py (Revised for Client-Side STT, CORS, Logging, AND VIDEO FRAMES)
import os
import logging # <--- Added
from dotenv import load_dotenv
import asyncio
import threading
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
from geopy.geocoders import Nominatim # Import geopy
from datetime import datetime # Import datetime

# === Logging Setup ===
# Set logging to DEBUG for all modules (Flask, SocketIO, etc.)
logging.basicConfig(level=logging.DEBUG)

load_dotenv()
from ADA_Online import ADA # Make sure filename matches ADA_Online.py

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'a_default_fallback_secret_key!')

REACT_APP_PORT = os.getenv('REACT_APP_PORT', '5173')
REACT_APP_ORIGIN = f"http://localhost:{REACT_APP_PORT}"
REACT_APP_ORIGIN_IP = f"http://127.0.0.1:{REACT_APP_PORT}"

socketio = SocketIO(
    app,
    async_mode='threading',
    cors_allowed_origins="*",
    logger=True,           # <--- Enable Flask-SocketIO logs
    engineio_logger=True   # <--- Enable Engine.IO logs
)

ada_instances = {} # Dictionary to store ADA instances per client SID
ada_loop = None
ada_thread = None
latest_user_location = "Unknown" # Store the latest known location

# Initialize geolocator
geolocator = Nominatim(user_agent="ada_app") # Added user_agent

def run_asyncio_loop(loop):
    """ Function to run the asyncio event loop in a separate thread """
    asyncio.set_event_loop(loop)
    try:
        print("Asyncio event loop started...")
        loop.run_forever()
    finally:
        print("Asyncio event loop stopping...")
        tasks = asyncio.all_tasks(loop=loop)
        for task in tasks:
            if not task.done():
                task.cancel()
        try:
            loop.run_until_complete(asyncio.gather(*[t for t in tasks if not t.done()], return_exceptions=True))
            loop.run_until_complete(loop.shutdown_asyncgens())
        except RuntimeError as e:
             print(f"RuntimeError during loop cleanup (might be expected if loop stopped abruptly): {e}")
        except Exception as e:
            print(f"Exception during loop cleanup: {e}")
        finally:
            if not loop.is_closed():
                loop.close()
        print("Asyncio event loop stopped.")

@socketio.on('connect')
def handle_connect():
    """ Handles new client connections """
    global ada_instances, ada_loop, ada_thread
    client_sid = request.sid
    print(f"\n--- handle_connect called for SID: {client_sid} ---")

    if ada_thread is None or not ada_thread.is_alive():
        print(f"    Asyncio thread not running. Starting new loop and thread.")
        ada_loop = asyncio.new_event_loop()
        ada_thread = threading.Thread(target=run_asyncio_loop, args=(ada_loop,), daemon=True)
        ada_thread.start()
        print("    Started asyncio thread.")
        socketio.sleep(0.1) # Give the loop a moment to start

    if client_sid not in ada_instances:
        print(f"    Creating NEW ADA instance for SID: {client_sid}")
        if not ada_loop or not ada_loop.is_running():
             print(f"    ERROR: Cannot create ADA instance, asyncio loop not ready for SID {client_sid}.")
             emit('error', {'message': 'Assistant initialization error (loop).'}, room=client_sid)
             return

        try:
            ada_instance = ADA(socketio_instance=socketio, client_sid=client_sid)
            ada_instances[client_sid] = ada_instance
            future = asyncio.run_coroutine_threadsafe(ada_instance.start_all_tasks(), ada_loop)
            print("    ADA instance created and tasks scheduled.")
        except ValueError as e:
            print(f"    ERROR initializing ADA (ValueError) for SID {client_sid}: {e}")
            emit('error', {'message': f'Failed to initialize assistant: {e}'}, room=client_sid)
            if client_sid in ada_instances: del ada_instances[client_sid]
            return
        except Exception as e:
            print(f"    ERROR initializing ADA (Unexpected) for SID {client_sid}: {e}")
            emit('error', {'message': f'Unexpected error initializing assistant: {e}'}, room=client_sid)
            if client_sid in ada_instances: del ada_instances[client_sid]
            return
    else:
        print(f"    ADA instance already exists for SID: {client_sid}. Reusing.")
        # Optionally update socketio_instance and client_sid if needed, though they should be correct

    if client_sid in ada_instances:
        emit('status', {'message': 'Connected to ADA Assistant'}, room=client_sid)
    print(f"--- handle_connect finished for SID: {client_sid} ---\n")


@socketio.on('disconnect')
def handle_disconnect():
    """ Handles client disconnections """
    global ada_instances
    client_sid = request.sid
    print(f"\n--- handle_disconnect called for SID: {client_sid} ---")

    if client_sid in ada_instances:
        print(f"    Client {client_sid} disconnected. Attempting to stop CHARLIE instance.")
        ada_instance = ada_instances[client_sid]
        if ada_loop and ada_loop.is_running():
            future = asyncio.run_coroutine_threadsafe(ada_instance.stop_all_tasks(), ada_loop)
            try:
                future.result(timeout=10)
                print(f"    CHARLIE tasks stopped successfully for SID: {client_sid}.")
            except TimeoutError:
                print(f"    Timeout waiting for CHARLIE tasks to stop for SID: {client_sid}.")
            except Exception as e:
                print(f"    Exception during CHARLIE task stop for SID {client_sid}: {e}")
            finally:
                 pass # Keep loop running

        else:
             print(f"    Cannot stop CHARLIE tasks for SID {client_sid}: asyncio loop not available or not running.")

        del ada_instances[client_sid]
        print(f"    CHARLIE instance cleared for SID: {client_sid}.")

    else:
         print(f"    Client {client_sid} disconnected, but no active CHARLIE instance found for this SID.")

    print(f"--- handle_disconnect finished for SID: {client_sid} ---\n")


@socketio.on('send_text_message')
def handle_text_message(data):
    """ Receives text message from client's input box """
    client_sid = request.sid
    message = data.get('message', '')
    print(f"Received text from {client_sid}: {message}")
    ada_instance = ada_instances.get(client_sid) # Get instance by SID
    if ada_instance:
        if ada_loop and ada_loop.is_running():
            # Get current date and time
            current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            # Pass text and date/time to process_input (location is set via set_location)
            asyncio.run_coroutine_threadsafe(ada_instance.process_input(message, is_final_turn_input=True, current_datetime=current_datetime), ada_loop)
            print(f"    Text message forwarded to CHARLIE for SID: {client_sid}")
        else:
            print(f"    Cannot process text message for SID {client_sid}: asyncio loop not ready.")
            emit('error', {'message': 'Assistant busy or loop error.'}, room=client_sid)
    else:
        print(f"    CHARLIE instance not found for SID: {client_sid}.")
        emit('error', {'message': 'Assistant not ready or session mismatch.'}, room=client_sid)


@socketio.on('send_transcribed_text')
def handle_transcribed_text(data):
    """ Receives final transcribed text from client's Web Speech API """
    client_sid = request.sid
    transcript = data.get('transcript', '')
    print(f"Received transcript from {client_sid}: {transcript}")
    ada_instance = ada_instances.get(client_sid) # Get instance by SID
    if transcript and ada_instance:
         if ada_loop and ada_loop.is_running():
            # Get current date and time
            current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            # Process transcript with end_of_turn=True implicitly handled in process_input -> run_gemini_session (location is set via set_location)
            asyncio.run_coroutine_threadsafe(ada_instance.process_input(transcript, is_final_turn_input=True, current_datetime=current_datetime), ada_loop)
            print(f"    Transcript forwarded to CHARLIE for SID: {client_sid}")
         else:
             print(f"    Cannot process transcript for SID {client_sid}: asyncio loop not ready.")
             emit('error', {'message': 'Assistant busy or loop error.'}, room=client_sid)
    elif not transcript:
         print("    Received empty transcript.")
    else:
         print(f"    CHARLIE instance not found for SID: {client_sid}.")


# ++++ ADD COORDINATE HANDLER ++++
@socketio.on('send_coordinates')
def handle_coordinates(data):
    """ Receives coordinates from client, performs reverse geocoding, and sends address back """
    client_sid = request.sid
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    print(f"Received coordinates from {client_sid}: Lat={latitude}, Lon={longitude}")

    if latitude is not None and longitude is not None:
        try:
            location = geolocator.reverse((latitude, longitude), exactly_one=True, language='en')
            if location and location.address:
                # Try to extract City, State (this depends heavily on Nominatim's response structure)
                address_parts = location.raw.get('address', {})
                city = address_parts.get('city', address_parts.get('town', address_parts.get('village', '')))
                state = address_parts.get('state', '')
                country = address_parts.get('country', '') # Added country

                if city and state:
                    formatted_address = f"{city}, {state}"
                elif city and country: # Fallback if state isn't available
                    formatted_address = f"{city}, {country}"
                elif state and country: # Fallback if city isn't available
                    formatted_address = f"{state}, {country}"
                else:
                    formatted_address = location.address # Fallback to full address

                print(f"    Reverse geocoded address for {client_sid}: {formatted_address}")
                emit('receive_address', {'address': formatted_address}, room=client_sid)
                # Pass location to ADA instance
                ada_instance = ada_instances.get(client_sid) # Get instance by SID
                if ada_instance:
                    ada_instance.set_location(formatted_address)
            else:
                print(f"    Could not reverse geocode coordinates for {client_sid}.")
                emit('receive_address', {'address': 'Address not found'}, room=client_sid)
        except Exception as e:
            print(f"    Error during reverse geocoding for {client_sid}: {e}")
            emit('receive_address', {'address': 'Geocoding error'}, room=client_sid)
    else:
        print(f"    Invalid coordinates received from {client_sid}.")
        emit('receive_address', {'address': 'Invalid coordinates'}, room=client_sid)


# **** ADD VIDEO FRAME HANDLER ****
@socketio.on('send_video_frame')
def handle_video_frame(data):
    """ Receives base64 video frame data from client """
    client_sid = request.sid
    frame_data_url = data.get('frame') # Expecting data URL like 'data:image/jpeg;base64,xxxxx'

    ada_instance = ada_instances.get(client_sid) # Get instance by SID
    if frame_data_url and ada_instance:
        if ada_loop and ada_loop.is_running():
            print(f"Received video frame from {client_sid}, forwarding...") # Optional: very verbose
            asyncio.run_coroutine_threadsafe(ada_instance.process_video_frame(frame_data_url), ada_loop)
        pass

@socketio.on('video_feed_stopped')
def handle_video_feed_stopped():
    """ Client signaled that the video feed has stopped. """
    client_sid = request.sid
    print(f"Received video_feed_stopped signal from {client_sid}.")
    ada_instance = ada_instances.get(client_sid) # Get instance by SID
    if ada_instance:
        if ada_loop and ada_loop.is_running():
            # Call a method on ADA instance to clear its video queue
            asyncio.run_coroutine_threadsafe(ada_instance.clear_video_queue(), ada_loop)
            print(f"    Video frame queue clearing requested for SID: {client_sid}")
        else:
            print(f"    Cannot clear video queue for SID {client_sid}: asyncio loop not ready.")
    else:
        print(f"    CHARLIE instance not found for SID: {client_sid}.")


if __name__ == '__main__':
    print("\nFlask-SocketIO log test: server is starting...\n")
    print("Starting Flask-SocketIO server...")
    try:
        # Added allow_unsafe_werkzeug=True to allow running with Werkzeug dev server
        socketio.run(app, debug=True, host='0.0.0.0', port=5001, use_reloader=False, allow_unsafe_werkzeug=True)
    finally:
        print("\nServer shutting down...")
        # Stop all ADA instances on server shutdown
        # No 'global' needed here as we are in the main script scope
        print(f"Attempting to stop {len(ada_instances)} active CHARLIE instance(s) on server shutdown...")
        for client_sid, ada_instance in list(ada_instances.items()): # Iterate over a copy
             print(f"    Stopping instance for SID: {client_sid}")
             if ada_loop and ada_loop.is_running():
                 future = asyncio.run_coroutine_threadsafe(ada_instance.stop_all_tasks(), ada_loop)
                 try:
                     future.result(timeout=5)
                     print(f"    CHARLIE tasks stopped successfully for SID: {client_sid}.")
                 except TimeoutError:
                     print(f"    Timeout waiting for CHARLIE tasks to stop for SID {client_sid} during shutdown.")
                 except Exception as e:
                     print(f"    Exception during CHARLIE task stop for SID {client_sid}: {e}")
                 finally:
                      pass # Keep loop running
             else:
                 print(f"    Cannot stop CHARLIE instance for SID {client_sid}: asyncio loop not available.")
             # Check if key exists before deleting, although iterating over items should guarantee it
             if client_sid in ada_instances:
                 del ada_instances[client_sid] # Remove from dictionary

        if ada_loop and ada_loop.is_running():
             print("Stopping asyncio loop from main thread...")
             ada_loop.call_soon_threadsafe(ada_loop.stop)
             if ada_thread and ada_thread.is_alive():
                 ada_thread.join(timeout=5)
                 if ada_thread.is_alive():
                     print("Warning: Asyncio thread did not exit cleanly.")
             print("Asyncio loop/thread stop initiated.")
        print("Shutdown complete.")
