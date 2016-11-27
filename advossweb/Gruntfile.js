module.exports = function (grunt) {

    grunt.initConfig({
        min: {

        },
        includeSource: {
            options: {
                basePath: 'app/',
                //baseUrl:'/',
                templates: {
                    html: {
                        js:'<script src="{filePath}"></script>'
                    }
                }
            },
            target: {
                files: {
                    'app/index.html': 'app/index.start.tpl.html'
                }
            }
        },
    });



    grunt.loadNpmTasks('grunt-include-source');
    grunt.registerTask('default', ['includeSource']);
}