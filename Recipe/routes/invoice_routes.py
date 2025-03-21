from flask import Blueprint, request, jsonify
from invoice import process_invoice_pdf

invoice_bp = Blueprint('invoice', __name__)


@invoice_bp.route('/upload-invoice', methods=['POST'])
def upload_invoice():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and file.filename.endswith('.pdf'):
        file_data = file.read()
        result = process_invoice_pdf(file_data)
        if 'error' in result:
            return jsonify(result), 400
        return jsonify(result)

    return jsonify({"error": "Invalid file format"}), 400
