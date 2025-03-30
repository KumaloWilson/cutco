from flask import Flask, request, jsonify, Response, make_response
from flask_cors import CORS
from pymongo import MongoClient
from utils import generate_token, store_token, store_ledger, get_last_ledger_entry, format_phone_number, token_info
import datetime
from chromastone import Chromastone
from time import sleep
import logging
import os
import random
import string
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io

from dotenv import load_dotenv


load_dotenv()


logging.basicConfig(level=logging.DEBUG)
technician_number = os.environ.get("TECHNICIAN_NUMBER") 
TUCKSHOP_ID = str(os.environ.get("TUCKSHOP_ID"))
chromastone_api_key = os.environ.get("CHROMASTONE_API_KEY")


mongo = MongoClient(host=os.environ.get("MONGO_URI"))
db = mongo["cutcoin"]
tokens_collection = db.tokens

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


client = Chromastone(chromastone_api_key)


@app.route('/tx', methods=['POST'])
def tx():
    # Extract data from the request
    data = request.json
    logging.info(f'Received data: {data}')
    phone_number = data.get('phone_number')
    transaction_type = data.get('transaction_type')


    phone_number = format_phone_number(phone_number=phone_number)
    if transaction_type == 'deposit':

        if phone_number=='invalid phone number':
            return f'Error:{phone_number}', 300
        
        change_amount = float(data.get('amount'))
        current_time = datetime.datetime.now()
        logging.info(f'Creating token for {phone_number} with change amount of {change_amount} at {current_time}')

    
        # Generate the token
        token_id = generate_token(tuckshop_id=TUCKSHOP_ID, phone_number=phone_number, change_amount=change_amount, current_time=current_time)
    
        token_info = {
            'token_id': token_id,
            'date': current_time,
            'change_amount': change_amount,
            'tuckshop_id': TUCKSHOP_ID,
            'confirmation_key': random.choice(string.ascii_uppercase),
            'type': 'credit',
        }
        logging.info(f'Token generated: {token_id}\n Token Info: {token_info}')

        store_token(token_id=token_id, token_info=token_info)
        new_balance = store_ledger(phone_number=phone_number, transaction=token_info) ### this is where the bug is
        logging.info(f"stored token and new balance is: {new_balance}")

        if type(new_balance)==float:
            client.send_sms(source_number="cutcoin", destination_number=phone_number, message=f'You have received: ${change_amount}USD\nFrom TuckShop: {TUCKSHOP_ID}\nNew hitcoin balance: ${new_balance} USD')
            logging.info(f'Token created: {token_id}')
            return jsonify({'tx_hash': token_id, 'tx_info': token_info, 'new_balance': new_balance}), 201
        
        else:
            logging.info(f'new_balance is of type {type(new_balance)}')
            return "Internal Server Error",500
        
    elif transaction_type == 'withdrawal':
        amount = float(request.json.get('amount'))
        # Find the balance from the ledgers collection so edit this line
        last_ledger_entry = get_last_ledger_entry(phone_number)
        old_balance = last_ledger_entry['balance']

        if old_balance < amount:
            logging.info(f'Insufficient balance: {old_balance}')
            return jsonify({'message': 'Insufficient balance', 'validated': False}), 400

        token_id = last_ledger_entry['transactions'][-1]['token_id']
        confirmation_key = random.choice(string.ascii_uppercase)
        # Prepare the debit transaction for the ledger
        debit_transaction = {
            'destroyed_token_id': token_id,
            'confirmation_key': confirmation_key,
            'date': datetime.datetime.now(),
            'amount': amount,  # amount is positive store_ledger will handle the sign
            'type': 'debit',
            'description': f'Redeemed change of ${amount} USD'
        }

        new_balance = store_ledger(phone_number, debit_transaction)

        logging.info(f'new ledger balance: {new_balance}')
        
        # Send confirmation SMS with the new balance
        client.send_sms(source_number="cutcoin", destination_number=phone_number, message=f'You have used ${amount}USD at Tuckshop:{TUCKSHOP_ID}.\nNew hitcoin balance: ${new_balance}USD\nConfirmation key: {confirmation_key}')
        
        # Include the new balance in the JSON response
        return jsonify({'message': f'Change of ${amount} USD used successfully', 'confirmation_key': confirmation_key, 'new_balance': new_balance, 'validated': True}), 200
    
    else:
        logging.error(f'invalid or missing transaction type')
        return jsonify({'message': f'invalid or missing transaction type: deposit or withdrawal'})


@app.route('/view_all_transactions', methods=['POST'])
def view_all_transactions():
    '''
    this endpoint accepts a phone number in the request, formats it into the 263*** format
    It then proceeds to look up in the ledgers db to find if any ledger of that phone number exists
    If so, it returns the transactions in a json format, before making them into a pdf and returning them to the frontend
    if not, then it returns a no transaction response, in which case the frontend can just display a no transactions alert'''
    phone_number = request.get_json().get('phone_number')
    ledger = get_last_ledger_entry(phone_number=phone_number)
    if ledger is None:
        return jsonify({'message': 'No Transaction exists'}), 400
    else:
        # Process the transactions to be JSON serializable
        transactions = ledger.get('transactions', [])
        processed_transactions = []
        for transaction in transactions:
            processed_transaction = {
                'date': transaction['date'].strftime('%Y-%m-%d %H:%M:%S'),
                'amount': transaction.get('amount') or transaction.get('change_amount', 'N/A'),
                'type': transaction.get('type', 'N/A'),
                'description': transaction.get('description', 'No description provided')
            }
            processed_transactions.append(processed_transaction)

        return jsonify({
            'phone_number': ledger['phone_number'],
            'balance': ledger['balance'],
            'transactions': processed_transactions
        }), 200


@app.route('/use_change', methods=['POST'])
def redeem_token():
    '''
    this endpoint should first check if the user has enough balance to redeem the amount provided here is how it does it:
    1) by checking the balance from the users mongo ledgers collection  (search by phone number)
    2) it compares the balance with the amount provided in the request if the balance is greater
    if so, it proceeds to deduct from the users balance (perfom the debit_transaction) and delete the token (token_id should be found in the ledger document)
    if not, it should return an error message(insufficient balance)
    '''
    phone_number = request.json.get('phone_number')
    amount = float(request.json.get('amount'))


    last_ledger_entry = get_last_ledger_entry(phone_number)
    old_balance = last_ledger_entry['balance']

    if old_balance < amount:
        logging.info(f'Insufficient balance: {old_balance}')
        return jsonify({'message': 'Insufficient balance', 'validated': False}), 400

    token_id = last_ledger_entry['transactions'][-1]['token_id']
    confirmation_key = random.choice(string.ascii_uppercase)
    # Prepare the debit transaction for the ledger
    debit_transaction = {
        'destroyed_token_id': token_id,
        'confirmation_key': confirmation_key,
        'date': datetime.datetime.now(),
        'amount': amount,  # amount is positive store_ledger will handle the sign
        'type': 'debit',
        'description': f'Redeemed change of ${amount} USD'
    }

    new_balance = store_ledger(phone_number, debit_transaction)

    logging.info(f'new ledger balance: {new_balance}')
    
    # Send confirmation SMS with the new balance
    client.send_sms(source_number="cutcoin", destination_number=phone_number, message=f'You have used ${amount}USD at Tuckshop:{TUCKSHOP_ID}.\nNew hitcoin balance: ${new_balance}USD\nConfirmation key: {confirmation_key}')
    
    # Include the new balance in the JSON response
    return jsonify({'message': f'Change of ${amount} USD used successfully', 'confirmation_key': confirmation_key, 'new_balance': new_balance, 'validated': True}), 200

   
@app.route('/buy_airtime', methods=['POST'])
def buy_airtime():
    '''this endpoint receives the traffic from africastalking and processes the airtime purchase'''
    data = request.form
    # we need to extract the received data
    session_id = request.values.get("sessionId", None)
    service_code = request.values.get("serviceCode", None)
    global originator_phone_number
    originator_phone_number = format_phone_number(request.values.get("phoneNumber", None))
    text = request.values.get("text", "default")
    global response_text
    global phone_number
    global amount
    if text == "":
        response_text = "CON Welcome to hitcoin.\n"
        response_text += "1. Buy airtime\n"
        response_text += "2. Check balance\n"
        response_text += "3. Send hitcoin\n"
        response_text += "4. Register for hitcoin"
    
    elif text == "1":
        response_text = "CON Enter the amount you want to buy"
    elif text.startswith("1*"):
        parts = text.split('*')
        if len(parts) == 2 and parts[0] == "1":
            amount = float(parts[1])
            response_text = f"CON Are you sure you want to buy airtime worth $ {amount} USD?\n1. Yes\n2. No"
        elif len(parts) == 3 and parts[0] == "1":
            #proceed to buy the airtime
            choice = parts[2]
            if choice == "1":
                # Process the transaction
                # Find the balance from the ledgers collection so edit this line
                last_ledger_entry = get_last_ledger_entry(originator_phone_number)
                old_balance = last_ledger_entry['balance']
                if old_balance < amount:
                    logging.info(f'Insufficient balance: {old_balance}')
                    response_text = "END Insufficient balance"
                else:
                    confirmation_key = random.choice(string.ascii_uppercase)
                    # Prepare the debit transaction for the ledger
                    debit_transaction = {
                        'confirmation_key': confirmation_key,
                        'date': datetime.datetime.now(),
                        'amount': amount,  # amount is positive store_ledger will handle the sign
                        'type': 'debit',
                        'description': f'Bought airtime worth ${amount} USD'
                    }
                    new_balance = store_ledger(originator_phone_number, debit_transaction)
                    response_text = f"END You have bought airtime worth ${amount} USD\nNew balance: ${new_balance} USD"
                    client.send_sms(source_number="cutcoin", destination_number=originator_phone_number, message=f'You have bought airtime worth ${amount}USD.\nNew hitcoin balance: ${new_balance}USD')
            else:
                response_text = "END Transaction cancelled"
    elif text == "2":
        try:
            last_ledger_entry = get_last_ledger_entry(originator_phone_number)
            old_balance = last_ledger_entry['balance']
            response_text = f"END Your balance is $ {str(old_balance)} USD"
            client.send_sms(source_number="cutcoin", destination_number=originator_phone_number, message=f'Your hitcoin balance is ${old_balance}USD')
        except Exception as e:
            response_text = f"END an error occurred: {e}"
    elif text == "3":
        logging.info(f'received text: {text}')
        response_text = "CON Enter the phone number"
    elif text.startswith("3*"):
    # Check if the user is in the phone number input state
        parts = text.split('*')
        logging.info(f'parts: {parts}')
        if len(parts) == 2 and parts[0] == "3":
            # The user is in the phone number input state
            phone_number = parts[1]
            phone_number = format_phone_number(phone_number)
            # check if phone number exists in the ledger, if not, return that the user is not registered
            last_ledger_entry = get_last_ledger_entry(phone_number)
            if not last_ledger_entry:
                response_text = "END The phone number you are trying to send hitcoin to is not registered for hitcoin. Please ask them to register first"
            else:
                logging.info(f'formatted phone number: {phone_number}')
                if phone_number == 'invalid phone number':
                    response_text = "END Invalid phone number. Please try again."
                else:
                    response_text = "CON Enter the amount you want to send"
        elif len(parts) == 3 and parts[0] == "3":
            # The user is in the amount input state
            amount = float(parts[2])
            # Transition to the next state: confirming the transaction
            response_text = f"CON Confirm sending ${amount} USD to {phone_number}\n1. Yes\n2. No"
        elif len(parts) == 4 and parts[0] == "3":
            # The user is in the confirmation state
            choice = parts[3]
            if choice == "1":
                last_ledger_entry = get_last_ledger_entry(originator_phone_number)
                old_balance = last_ledger_entry['balance']
                if old_balance < amount:
                    logging.info(f'Insufficient balance: {old_balance}')
                    response_text = "END Insufficient balance"
                else:
                    confirmation_key = random.choice(string.ascii_uppercase)
                    # Prepare the debit transaction for the ledger
                    debit_transaction = {
                        'confirmation_key': confirmation_key,
                        'date': datetime.datetime.now(),
                        'amount': amount,  # amount is positive store_ledger will handle the sign
                        'type': 'debit',
                        'description': f'Redeemed change of ${amount} USD'
                    }
                    new_balance = store_ledger(originator_phone_number, debit_transaction)
                    #prepare the credit transaction for the receiver
                    credit_transaction = {
                        'confirmation_key': confirmation_key,
                        'date': datetime.datetime.now(),
                        'change_amount': amount,  # amount is positive store_ledger will handle the sign
                        'type': 'credit',
                        'description': f'Received hitcoin of ${amount} USD from {phone_number}'
                    }
                    receiver_balance = store_ledger(phone_number, credit_transaction)
            
                    response_text = f"END Sent ${amount} USD to {phone_number}\nNew balance: ${new_balance} USD"
                    client.send_sms(source_number="cutcoin", destination_number=originator_phone_number, message=f'You have sent ${amount}USD to {phone_number}.\nNew hitcoin balance: ${new_balance}USD\nConfirmation key: {confirmation_key}')
                    sleep(1)
                    client.send_sms(source_number="cutcoin", destination_number=phone_number, message=f'You have received ${amount}USD from {phone_number}.\nNew hitcoin balance: ${receiver_balance}USD\nConfirmation key: {confirmation_key}')
            else:
                response_text = "END Transaction cancelled"
    elif text == "4":
        #check if the phone number exists in the ledger already and if not, add a ledger with a 0 balance and return a registration message
        last_ledger_entry = get_last_ledger_entry(originator_phone_number)
        if last_ledger_entry:
            response_text = "END You are already registered for hitcoin"
        else:
            #add a new ledger entry with a 0 balance
            new_ledger_entry = {
                'phone_number': originator_phone_number,
                'balance': 0,
                'transactions': []
            }
            try:
                ledgers_collection = db.ledgers
                result = ledgers_collection.insert_one(new_ledger_entry)
                if result.inserted_id:
                    response_text = "END You have been registered for hitcoin"
                else:
                    response_text = "END Error registering for hitcoin"
            except Exception as e:
                response_text = f"END An error occurred: {e}"
    else:
        # Invalid input format or state transition
        response_text = "END Invalid input. Please try again."
    
    # Create a response object with text/plain content type
    response = Response(response_text, content_type='text/plain')

    return response



@app.route('/available_tokens', methods=['GET'])
def available_tokens():

    available_tokens = tokens_collection.find({}, {'_id': 0, 'token_id': 1, 'token_info': 1})

    return jsonify({'available_tokens': list(available_tokens)}), 200

@app.route('/get_tx', methods=['POST'])
def get_tx():
    data = request.json
    tx_hash = data.get('tx_hash')

    transaction = token_info(token_id=tx_hash)
    return jsonify(transaction), 200


@app.route('/text_technician', methods=['GET'])
def text_technician():

    client.send_sms(source_number=TUCKSHOP_ID, destination_number=technician_number, message='Tuckshop B machine needs maintenance')

    return jsonify({'message': 'Technician has been notified'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=os.environ.get('PORT', 5000), debug=True)