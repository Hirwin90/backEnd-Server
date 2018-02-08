var express = require('express');
var fs = require('fs');
var fileUpload = require('express-fileupload');
var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // TIPOS DE COLECCION
    var tiposColeccion = ['hospitales', 'medicos', 'usuarios'];
    if (tiposColeccion.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valida',
            errors: { message: 'Los tipos de coleccion validas son ' + tiposColeccion.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // OBTENER DATOS DEL ARCHIVOS
    var archivo = req.files.image;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // SOLO ESTAS EXTENCIONES ACEPTAMOS
    var extencionesValidas = ['png', 'jpg', 'gif', 'jpge'];

    if (extencionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones validas son ' + extencionesValidas.join(', ') }
        });
    }

    // NOMBRE DE ARCHIVO PERSONALIZADO
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo}`;

    // MOVER EL ARCHIVO DEL TEMPORAL A UN PATH
    var path = `./upload/${ tipo }/${ nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, res);
    })
});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                })
            }

            var pathViejo = './upload/usuarios/' + usuario.img;

            // ELIMINA EL PATH ANTERIOR
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizado.',
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Medico no existe',
                    errors: { message: 'Medico no existe' }
                })
            }

            var pathViejo = './upload/medicos/' + medico.img;

            // ELIMINA EL PATH ANTERIOR
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizado.',
                    medico: medicoActualizado
                });
            });
        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                })
            }

            var pathViejo = './upload/hospitales/' + hospital.img;

            // ELIMINA EL PATH ANTERIOR
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizado.',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}


module.exports = app;