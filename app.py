from flask import Flask, render_template, request, session, redirect, url_for, jsonify

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
# API TIBASOSA
# =====================================================

@app.route('/api/tibasosa_animales')
def api_tibasosa_animales():

    docs = db.collection("Tibasosa").stream()

    animales = []

    for doc in docs:

        animales.append(doc.to_dict())

    return jsonify(animales)

# =====================================================
# API CORRALES
# =====================================================

@app.route('/api/corrales_animales')
def api_corrales_animales():

    docs = db.collection("Corrales").stream()

    animales = []

    for doc in docs:

        animales.append(doc.to_dict())

    return jsonify(animales)

# =====================================================
# API IZA
# =====================================================

@app.route('/api/iza_animales')
def api_iza_animales():

    docs = db.collection("Iza").stream()

    animales = []

    for doc in docs:

        animales.append(doc.to_dict())

    return jsonify(animales)

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

    # =========================================
    # REDIRECCIONES
    # =========================================

    if carretera == "Corrales":

        return redirect(url_for('simulador_corrales'))

    elif carretera == "Iza":

        return redirect(url_for('simulador_iza'))

    else:

        return redirect(url_for('simulador_tibasosa'))

# =====================================================
# SIMULADOR TIBASOSA
# =====================================================

@app.route('/simulador_tibasosa')
def simulador_tibasosa():

    vehiculo = session.get('vehiculo', 'camioneta')
    clima = session.get('clima', 'Soleado')
    dificultad = session.get('dificultad', 'Media')

    # Animales base
    animales = [
        {
            "nombre": "Zorro",
            "descripcion": "Cruce frecuente en la vía",
            "imagen": "zorro"
        },
        {
            "nombre": "Venado",
            "descripcion": "Animal detectado cerca del río",
            "imagen": "venado"
        },
        {
            "nombre": "Conejo",
            "descripcion": "Cruce inesperado en carretera",
            "imagen": "conejo"
        },
        {
            "nombre": "Ardilla",
            "descripcion": "Paso rápido entre árboles",
            "imagen": "ardilla"
        },
        {
            "nombre": "Perro",
            "descripcion": "Animal doméstico en la vía",
            "imagen": "perro"
        },
        {
            "nombre": "Gato",
            "descripcion": "Cruce nocturno frecuente",
            "imagen": "gato"
        },
        {
            "nombre": "Lechuza",
            "descripcion": "Vuelo bajo cercano",
            "imagen": "lechuza"
        },
        {
            "nombre": "Caballo",
            "descripcion": "Animal suelto en carretera",
            "imagen": "caballo"
        }
    ]

    # Cargar animales de Firebase
    try:
        docs = db.collection("Tibasosa").stream()

        for doc in docs:
            datos = doc.to_dict()

            animales.append({
                "nombre": datos.get("nombre", "Animal"),
                "descripcion": datos.get("descripcion", "Cruce de fauna"),
                "imagen": datos.get("imagen", "default")
            })

    except Exception as e:
        print("ERROR FIREBASE:", e)

    print("===================================")
    print("ANIMALES TIBASOSA")
    print(animales)
    print("===================================")

    return render_template(
        'simulador_tibasosa.html',
        vehiculo=vehiculo,
        carretera="Tibasosa",
        clima=clima,
        dificultad=dificultad,
        animales=animales
    )

# =====================================================
# SIMULADOR IZA
# =====================================================

@app.route('/simulador_iza')
def simulador_iza():

    vehiculo = session.get('vehiculo', 'camioneta')

    clima = session.get('clima', 'Soleado')

    dificultad = session.get('dificultad', 'Media')

    # =========================================
    # ANIMALES IZA
    # =========================================

    docs = db.collection("Iza").stream()

    animales = []

    for doc in docs:

        datos = doc.to_dict()

        animales.append({

            "nombre": datos.get("nombre", "Animal"),
            "descripcion": datos.get("descripcion", "Cruce de fauna"),
            "imagen": datos.get("imagen", "default.png")

        })

    print("===================================")
    print("ANIMALES IZA")
    print(animales)
    print("===================================")

    return render_template(

        'simulador_iza.html',

        vehiculo=vehiculo,

        carretera="Iza",

        clima=clima,

        dificultad=dificultad,

        animales=animales
    )

# =====================================================
# MAIN
# =====================================================

if __name__ == '__main__':

    app.run(
        host="0.0.0.0",
        port=10000,
        debug=True
    )