from flask import Flask, render_template, request, session, redirect, url_for, jsonify, send_file
import firebase_admin
from firebase_admin import credentials, firestore
from docx import Document
from openpyxl import Workbook
import io

# =====================================================
# FLASK
# =====================================================

app = Flask(__name__)
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


@app.route('/instrucciones')
def instrucciones():
    return render_template('instrucciones.html')


@app.route('/tablas')
def tablas():
    return render_template('tablas.html')


# =====================================================
# TABLAS
# =====================================================

@app.route('/tibasosa')
def tibasosa():
    docs = db.collection("Tibasosa").stream()
    datos = [doc.to_dict() for doc in docs]
    return render_template('tibasosa.html', datos=datos)


@app.route('/corrales')
def corrales():
    docs = db.collection("Corrales").stream()
    datos = [doc.to_dict() for doc in docs]
    return render_template('corrales.html', datos=datos)


@app.route('/iza')
def iza():
    docs = db.collection("Iza").stream()
    datos = [doc.to_dict() for doc in docs]
    return render_template('iza.html', datos=datos)


# =====================================================
# API
# =====================================================

@app.route('/api/tibasosa_animales')
def api_tibasosa_animales():
    docs = db.collection("Tibasosa").stream()
    return jsonify([doc.to_dict() for doc in docs])


@app.route('/api/corrales_animales')
def api_corrales_animales():
    docs = db.collection("Corrales").stream()
    return jsonify([doc.to_dict() for doc in docs])


@app.route('/api/iza_animales')
def api_iza_animales():
    docs = db.collection("Iza").stream()
    return jsonify([doc.to_dict() for doc in docs])


# =====================================================
# REGISTRO
# =====================================================

@app.route('/registro', methods=['GET', 'POST'])
def registro():

    if request.method == 'POST':
        session['nombre'] = request.form.get('nombre')
        session['vehiculo'] = request.form.get('vehiculo')

        return redirect(url_for('seleccion_carretera'))

    return render_template('registro.html')


# =====================================================
# SELECCIÓN CARRETERA
# =====================================================

@app.route('/seleccion_carretera')
def seleccion_carretera():
    return render_template('seleccion_carretera.html')


@app.route('/seleccion_vehiculo', methods=['POST'])
def seleccion_vehiculo():

    carretera = request.form.get('carretera')

    if not carretera:
        return redirect(url_for('seleccion_carretera'))

    session['carretera'] = carretera

    return redirect(url_for('pagina_vehiculo'))


@app.route('/seleccion_vehiculo')
def pagina_vehiculo():
    return render_template('seleccion_vehiculo.html')


# =====================================================
# GUARDAR VEHÍCULO DEL SIMULADOR
# =====================================================

@app.route('/guardar_vehiculo', methods=['POST'])
def guardar_vehiculo():

    vehiculo_simulador = request.form.get('vehiculo')

    if not vehiculo_simulador:
        return redirect(url_for('pagina_vehiculo'))

    session['vehiculo_simulador'] = vehiculo_simulador

    return redirect(url_for('opciones'))


# =====================================================
# OPCIONES
# =====================================================

@app.route('/opciones')
def opciones():
    return render_template('opciones.html')


@app.route('/guardar_opciones', methods=['POST'])
def guardar_opciones():

    session['clima'] = request.form.get('clima')
    session['dificultad'] = request.form.get('dificultad')

    carretera = session.get('carretera')

    if carretera == "Corrales":
        return redirect(url_for('simulador_corrales'))

    elif carretera == "Iza":
        return redirect(url_for('simulador_iza'))

    return redirect(url_for('simulador_tibasosa'))


# =====================================================
# FUNCIÓN CARGAR ANIMALES
# =====================================================

def cargar_animales(coleccion):

    docs = db.collection(coleccion).stream()
    animales = []

    for doc in docs:
        datos = doc.to_dict()

        animales.append({
            "nombre": datos.get("nombre", "Animal"),
            "descripcion": datos.get("descripcion", "Cruce de fauna"),
            "imagen": datos.get("imagen", "default.png")
        })

    return animales


# =====================================================
# SIMULADORES
# =====================================================

@app.route('/simulador_tibasosa')
def simulador_tibasosa():

    return render_template(
        'simulador_tibasosa.html',
        vehiculo=session.get('vehiculo_simulador', session.get('vehiculo')),
        carretera="Tibasosa",
        clima=session.get('clima'),
        dificultad=session.get('dificultad'),
        animales=cargar_animales("Tibasosa")
    )


@app.route('/simulador_corrales')
def simulador_corrales():

    return render_template(
        'simulador_corrales.html',
        vehiculo=session.get('vehiculo_simulador', session.get('vehiculo')),
        carretera="Corrales",
        clima=session.get('clima'),
        dificultad=session.get('dificultad'),
        animales=cargar_animales("Corrales")
    )


@app.route('/simulador_iza')
def simulador_iza():

    return render_template(
        'simulador_iza.html',
        vehiculo=session.get('vehiculo_simulador', session.get('vehiculo')),
        carretera="Iza",
        clima=session.get('clima'),
        dificultad=session.get('dificultad'),
        animales=cargar_animales("Iza")
    )


# =====================================================
# RESULTADO
# =====================================================

@app.route('/resultado')
def resultado():
    return render_template('resultado.html')


# =====================================================
# DESCARGAR EXCEL
# =====================================================

@app.route('/descargar_excel')
def descargar_excel():

    wb = Workbook()
    ws = wb.active
    ws.title = "Resultados"

    ws.append(["RESULTADOS DEL SIMULADOR"])
    ws.append(["Nombre", session.get('nombre')])
    ws.append(["Vehículo", session.get('vehiculo')])
    ws.append(["Carretera", session.get('carretera')])
    ws.append(["Clima", session.get('clima')])
    ws.append(["Dificultad", session.get('dificultad')])
    ws.append(["Puntaje", session.get('puntaje', 'No disponible')])
    ws.append(["Tiempo", session.get('tiempo', 'No disponible')])
    ws.append(["Velocidad", session.get('velocidad', 'No disponible')])
    ws.append(["Animales", session.get('animales', 'No disponible')])

    archivo = io.BytesIO()
    wb.save(archivo)
    archivo.seek(0)

    return send_file(
        archivo,
        as_attachment=True,
        download_name="resultados.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


# =====================================================
# DESCARGAR WORD
# =====================================================

@app.route('/descargar_word')
def descargar_word():

    doc = Document()
    doc.add_heading('RESULTADOS DEL SIMULADOR', 0)

    doc.add_paragraph(f"Nombre: {session.get('nombre')}")
    doc.add_paragraph(f"Vehículo: {session.get('vehiculo')}")
    doc.add_paragraph(f"Carretera: {session.get('carretera')}")
    doc.add_paragraph(f"Clima: {session.get('clima')}")
    doc.add_paragraph(f"Dificultad: {session.get('dificultad')}")
    doc.add_paragraph(f"Puntaje: {session.get('puntaje', 'No disponible')}")
    doc.add_paragraph(f"Tiempo: {session.get('tiempo', 'No disponible')}")
    doc.add_paragraph(f"Velocidad: {session.get('velocidad', 'No disponible')}")
    doc.add_paragraph(f"Animales: {session.get('animales', 'No disponible')}")

    archivo = io.BytesIO()
    doc.save(archivo)
    archivo.seek(0)

    return send_file(
        archivo,
        as_attachment=True,
        download_name="resultados.docx",
        mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )


# =====================================================
# MAIN
# =====================================================

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=10000, debug=True)