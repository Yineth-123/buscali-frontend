// Configuración Metro recomendada por Expo (evita problemas al resolver el bundle en algunos entornos Windows/Android).
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
