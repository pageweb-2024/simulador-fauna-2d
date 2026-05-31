from flask import Flask, render_template, request, session, redirect, url_for, jsonify, send_file
import firebase_admin
from firebase_admin import credentials, firestore
from openpyxl import Workbook
from openpyxl.chart import BarChart, Reference
import io

# ================= FLASK =================
app = Flask(__name__)
app.secret_key = "simuladorfauna"

# ================= FIREBASE =================
cred = credentials.Certificate("faunasimulador.json")

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ================= HOME =================
@app.route('/')
def inicio():
    return render_template('index.html')

@app.route('/instrucciones')
def instrucciones():
    return render_template('instrucciones.html')

@app.route('/tablas')
def tablas():
    return render_template('tablas.html')

# ================= TABLAS =================
@app.route('/tibasosa')
def tibasosa():
    docs = db.collection("Tibasosa").stream()

    animales = [d.to_dict() for d in docs]

    return render_template('tibasosa.html', datos=animales)


@app.route('/corrales')
def corrales():
    docs = db.collection("Corrales").stream()

    animales = [d.to_dict() for d in docs]

    return render_template('corrales.html', datos=animales)


@app.route('/iza')
def iza():
    docs = db.collection("Iza").stream()

    animales = [d.to_dict() for d in docs]

    return render_template('iza.html', datos=animales)

# ================= FIREBASE =================
def cargar_animales(coleccion):
    try:
        docs = list(db.collection(coleccion).stream())

        animales = []

        for doc in docs:
            d = doc.to_dict()

            animales.append({
                "Animal": str(d.get("Animal", "")),
                "Imagen": str(d.get("Imagen", "")),
                "Información": str(d.get("Información", "")),
                "Nivel de aparición": str(d.get("Nivel de aparición", "")),
                "Tipo de cruce": str(d.get("Tipo de cruce", ""))
            })

        return animales

    except Exception as e:
        print("🔥 ERROR FIREBASE:", e)
        return []

# ================= REGISTRO =================
@app.route('/registro', methods=['GET', 'POST'])
def registro():
    if request.method == 'POST':
        session['nombre'] = request.form.get('nombre', '')
        return redirect(url_for('seleccion_carretera'))

    return render_template('registro.html')

# ================= CARRETERA =================
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

# ================= VEHÍCULO =================
@app.route('/guardar_vehiculo', methods=['POST'])
def guardar_vehiculo():
    vehiculo_simulador = request.form.get('vehiculo')

    if not vehiculo_simulador:
        return redirect(url_for('pagina_vehiculo'))

    session['vehiculo_simulador'] = vehiculo_simulador
    return redirect(url_for('opciones'))

# ================= OPCIONES =================
@app.route('/opciones')
def opciones():
    return render_template('opciones.html')

@app.route('/guardar_opciones', methods=['POST'])
def guardar_opciones():

    session['dificultad'] = request.form.get('dificultad', 'normal')

    if session['dificultad'] == "dificil":
        session['tiempo_base'] = 10
    else:
        session['tiempo_base'] = 20

    carretera = session.get('carretera')

    if carretera == "Corrales":
        return redirect(url_for('simulador_corrales'))
    elif carretera == "Iza":
        return redirect(url_for('simulador_iza'))
    else:
        return redirect(url_for('simulador_tibasosa'))

# ================= SIMULADORES =================
@app.route('/simulador_tibasosa')
def simulador_tibasosa():
    return render_template(
        'simulador_tibasosa.html',
        vehiculo=session.get('vehiculo_simulador', ''),
        carretera="Tibasosa",
        dificultad=session.get('dificultad', ''),
        tiempo_base=session.get('tiempo_base', 0),
        animales=cargar_animales("Tibasosa")
    )

@app.route('/simulador_corrales')
def simulador_corrales():
    return render_template(
        'simulador_corrales.html',
        vehiculo=session.get('vehiculo_simulador', ''),
        carretera="Corrales",
        dificultad=session.get('dificultad', ''),
        tiempo_base=session.get('tiempo_base', 0),
        animales=cargar_animales("Corrales")
    )

@app.route('/simulador_iza')
def simulador_iza():
    return render_template(
        'simulador_iza.html',
        vehiculo=session.get('vehiculo_simulador', ''),
        carretera="Iza",
        dificultad=session.get('dificultad', ''),
        tiempo_base=session.get('tiempo_base', 0),
        animales=cargar_animales("Iza")
    )

# ================= RESULTADO =================
@app.route('/resultado')
def resultado():
    return render_template(
        'resultado.html',
        puntaje=session.get('puntaje', 0),
        tiempo=session.get('tiempo', 0),
        velocidad=session.get('velocidad', 0),
        animales=session.get('animales_detectados', 0),
        frenadas=session.get('frenadas', 0),
        atropellados=session.get('atropellados', 0),
        salvados=session.get('salvados', 0),
        nombre=session.get('nombre', ''),
        vehiculo=session.get('vehiculo_simulador', ''),
        carretera=session.get('carretera', ''),
        dificultad=session.get('dificultad', '')
    )

# ================= EXCEL =================
@app.route('/descargar_excel')
def descargar_excel():

    wb = Workbook()
    ws = wb.active
    ws.title = "Resultados"

    datos = [
        ["Indicador", "Valor"],
        ["Nombre", session.get('nombre', '')],
        ["Vehículo", session.get('vehiculo_simulador', '')],
        ["Carretera", session.get('carretera', '')],
        ["Dificultad", session.get('dificultad', '')],
        ["Puntaje", session.get('puntaje', 0)],
        ["Tiempo", session.get('tiempo', 0)],
        ["Velocidad", session.get('velocidad', 0)],
        ["Animales Detectados", session.get('animales_detectados', 0)],
        ["Frenadas", session.get('frenadas', 0)],
        ["Atropellados", session.get('atropellados', 0)],
        ["Salvados", session.get('salvados', 0)]
    ]

    for fila in datos:
        ws.append(fila)

    chart = BarChart()
    data = Reference(ws, min_col=2, min_row=7, max_row=13)
    cats = Reference(ws, min_col=1, min_row=7, max_row=13)

    chart.add_data(data, titles_from_data=False)
    chart.set_categories(cats)
    chart.title = "Resultados del Simulador"

    ws.add_chart(chart, "E2")

    archivo = io.BytesIO()
    wb.save(archivo)
    archivo.seek(0)

    return send_file(
        archivo,
        as_attachment=True,
        download_name="resultados.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

# ================= MAIN =================
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=10000, debug=True)