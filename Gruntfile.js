
module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            dev: {
                options: {
                    hostname: '*',
                    port: 9678,
                    keepalive: true,
                    open: true
                }
            }
        },
        uglify: {
            options: {
                mangle: true,
                compress: {},
                preserveComments: 'some'
            },
            dist: {
                files: [{
                    'build/teledraw-canvas.min.js': ['<%= concat.js.dest %>']
                }]
            }
        },
        concat: {
            options: {
                stripBanners: true,
                banner: '/*! Teledraw Canvas - v<%= pkg.version %> | (c) <%= grunt.template.today("yyyy") %> Cameron Lakenen */\n\n' +
                        '(function () {\n\n',
                footer: '\n\n})();',
            },
            js: {
                src: [
                    'src/start.js',
                    'lib/*.js',
                    'src/teledraw-canvas.util.js',
                    'src/teledraw-canvas.js',
                    'src/canvas/*.js',
                    'src/canvas/tools/*.js'
                ],
                dest: 'build/teledraw-canvas.js'
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'build/',
                    src: ['*'],
                    dest: 'dist/',
                    filter: 'isFile'
                }]
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            files: ['Gruntfile.js', 'src/*.js', 'src/**/*.js']
        }
    });

    grunt.registerTask('default', ['jshint', 'concat']);
    grunt.registerTask('release', ['default', 'uglify', 'copy']);
    grunt.registerTask('serve', ['default', 'connect']);
};
