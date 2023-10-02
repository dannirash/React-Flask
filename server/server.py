from flask import Flask, request

app = Flask(__name__)

#Members API Route
@app.route("/members")
def members():
    return {"members": ["Member1", "Member2", "Member3"]}

#Camera API Route
@app.route('/camera', methods=['POST'])
def save_snapshot():
    try:
        snapshot_file = request.files['snapshot']
        if snapshot_file:
            snapshot_file.save('pics/snapshot.jpg')  # Save the snapshot to a specific path
            return 'Snapshot saved successfully', 200
        else:
            return 'Snapshot file not found', 400
    except Exception as e:
        return f'Error saving snapshot: {str(e)}', 500

if __name__ == "__main__":
    app.run(debug=True)