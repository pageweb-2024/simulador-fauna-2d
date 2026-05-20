from flask import Flask, render_template, request, session, redirect, url_for

import firebase_admin

from firebase_admin import credentials, firestore

# =====================================================
# FLASK
# =====================================================

app = Flask(__name__)

# =====================================================
# SECRET KEY
# =====================================================

app.secret_key = "simuladorfauna"

# =====================================================
# FIREBASE
# =====================================================

cred = credentials.Certificate("faunasimulador.json")

firebase_admin.initialize_app(cred)

db = firestore.client()

# =====================================================
# INICIO
# =====================================================

@app.route('/')
def inicio():

    return render_template('index.html')

# =====================================================
# INSTRUCCIONES
# =====================================================

@app.route('/instrucciones')
def instrucciones():

    return render_template('instrucciones.html')

# =====================================================
# TABLAS
# =====================================================

@app.route('/tablas')
def tablas():

    return render_template('tablas.html')

# =====================================================
# TABLA TIBASOSA
# =====================================================

@app.route('/tibasosa')
def tibasosa():

    docs = db.collection("Tibasosa").stream()

    datos = []

    for doc in docs:

        datos.append(doc.to_dict())

    return render_template(
        'tibasosa.html',
        datos=datos
    )

# =====================================================
# TABLA CORRALES
# =====================================================

@app.route('/corrales')
def corrales():

    docs = db.collection("Corrales").stream()

    datos = []

    for doc in docs:

        datos.append(doc.to_dict())

    return render_template(
        'corrales.html',
        datos=datos
    )

# =====================================================
# TABLA IZA
# =====================================================

@app.route('/iza')
def iza():

    docs = db.collection("Iza").stream()

    datos = []

    for doc in docs:

        datos.append(doc.to_dict())

    return render_template(
        'iza.html',
        datos=datos
    )

# =====================================================
# REGISTRO
# =====================================================

@app.route('/registro')
def registro():

    return render_template('registro.html')

# =====================================================
# SELECCIÓN CARRETERA
# =====================================================

@app.route('/seleccion_carretera')
def seleccion_carretera():

    return render_template('seleccion_carretera.html')

# =====================================================
# GUARDAR CARRETERA
# =====================================================

@app.route('/seleccion_vehiculo', methods=['POST'])
def seleccion_vehiculo():

    carretera = request.form.get('carretera')

    if not carretera:

        return redirect(url_for('seleccion_carretera'))

    session['carretera'] = carretera

    print("===================================")
    print("CARRETERA:", carretera)
    print("===================================")

    return redirect(url_for('pagina_vehiculo'))

# =====================================================
# PÁGINA VEHÍCULO
# =====================================================

@app.route('/seleccion_vehiculo')
def pagina_vehiculo():

    return render_template('seleccion_vehiculo.html')

# =====================================================
# GUARDAR VEHÍCULO
# =====================================================

@app.route('/guardar_vehiculo', methods=['POST'])
def guardar_vehiculo():

    vehiculo = request.form.get('vehiculo')

    if not vehiculo:

        return redirect(url_for('pagina_vehiculo'))

    session['vehiculo'] = vehiculo

    print("===================================")
    print("VEHÍCULO:", vehiculo)
    print("===================================")

    return redirect(url_for('opciones'))

# =====================================================
# OPCIONES
# =====================================================

@app.route('/opciones')
def opciones():

    return render_template('opciones.html')

# =====================================================
# GUARDAR OPCIONES
# =====================================================

@app.route('/guardar_opciones', methods=['POST'])
def guardar_opciones():

    clima = request.form.get('clima')

    dificultad = request.form.get('dificultad')

    session['clima'] = clima

    session['dificultad'] = dificultad

    carretera = session.get('carretera')

    print("===================================")
    print("Carretera:", carretera)
    print("Vehículo:", session.get('vehiculo'))
    print("Clima:", clima)
    print("Dificultad:", dificultad)
    print("===================================")

    # =================================================
    # REDIRECCIÓN SEGÚN CARRETERA
    # =================================================

    if carretera == "Corrales":

        return redirect(url_for('simulador_corrales'))

    elif carretera == "Tibasosa":

        return redirect(url_for('simulador_tibasosa'))

    elif carretera == "Iza":

        return redirect(url_for('simulador_iza'))

    else:

        return redirect(url_for('simulador_tibasosa'))

# =====================================================
# SIMULADOR TIBASOSA
# =====================================================

@app.route('/simulador_tibasosa')
def simulador_tibasosa():

    vehiculo = session.get('vehiculo', 'default')

    clima = session.get('clima', 'Soleado')

    dificultad = session.get('dificultad', 'Media')

    return render_template(
        'simulador_tibasosa.html',
        vehiculo=vehiculo,
        carretera="Tibasosa",
        clima=clima,
        dificultad=dificultad
    )

# =====================================================
# SIMULADOR CORRALES
# =====================================================

@app.route('/simulador_corrales')
def simulador_corrales():

    vehiculo = session.get('vehiculo', 'default')

    clima = session.get('clima', 'Soleado')

    dificultad = session.get('dificultad', 'Media')

    return render_template(
        'simulador_corrales.html',
        vehiculo=vehiculo,
        carretera="Corrales",
        clima=clima,
        dificultad=dificultad
    )

# =====================================================
# SIMULADOR IZA
# =====================================================

@app.route('/simulador_iza')
def simulador_iza():

    vehiculo = session.get('vehiculo', 'default')

    clima = session.get('clima', 'Soleado')

    dificultad = session.get('dificultad', 'Media')

    return render_template(
        'simulador_iza.html',
        vehiculo=vehiculo,
        carretera="Iza",
        clima=clima,
        dificultad=dificultad
    )

# =====================================================
# MAIN
# =====================================================

if __name__ == '__main__':

    app.run(debug=True)