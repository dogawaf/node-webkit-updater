var exec = require('child_process').exec;

var isWin = /^win/.test(process.platform);
var isMac = /^darwin/.test(process.platform);
var isLinux = /^linux/.test(process.platform);
var is32 = process.arch == 'ia32';
var is64 = process.arch == 'x64';

///^win/.test(process.platform)?'win':/^darwin/.test(process.platform)?'mac':process.arch == 'ia32'?'linux32':'linux64';

module.exports = function(grunt){
  var dest = grunt.option('dest') || './deploy';
  var src = grunt.option('src') || './app';
  grunt.initConfig({
    clean:{
      main: ['test/app']
    },
    compress:{
      win:{
        options: {
          mode: 'zip',
          archive: dest + '/releases/updapp/win/updapp.zip'
        },
        expand: true,
        cwd: dest + '/releases/updapp/win/updapp',
        src: ['**/**'],
        dest: '/updapp'
      },
      linux32:{
        options: {
          mode: 'tgz',
          archive: dest + '/releases/updapp/linux32/updapp.tar.gz'
        },
        expand: true,
        cwd: dest + '/releases/updapp/linux32/updapp',
        src: ['**/**'],
        dest: 'updapp/'
      },
      linux64:{
        options: {
          mode: 'tgz',
          archive: dest + '/releases/updapp/linux64/updapp.tar.gz'
        },
        expand: true,
        cwd: dest + '/releases/updapp/linux64/updapp',
        src: ['**/**'],
        dest: 'updapp/'
      }
    },
    nodewebkit: {
      options: {
        build_dir: dest, // Where the build version of my node-webkit app is saved
        mac: isMac, // We want to build it for mac
        win: isWin,
        linux32: isLinux && is32,
        linux64: isLinux && is64,
        version: '0.9.2',
        toolbar: false,
        frame: false
      },
      src: [ src + '/**/*'] // Your node-wekit app
    },
    mochaTest:{
      test:{
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.spec.js']
      }
    },
    copy:{
      win:{
        src: 'tools/*',
        dest: dest + '/releases/updapp/win/updapp/'
      }
    }
  });
  grunt.loadNpmTasks('grunt-node-webkit-builder');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');


  grunt.registerTask('packageMac', function(){
    var done = this.async();
    console.log('packaging...', 'hdiutil create -format UDZO -srcfolder ' + dest + '/releases/updapp/mac/updapp.app ' + dest + '/releases/updapp/mac/updapp.dmg');
    
    exec('hdiutil create -format UDZO -srcfolder ' + dest + '/releases/updapp/mac/updapp.app ' + dest + '/releases/updapp/mac/updapp.dmg',function(error, stdout, stderr){
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
      done()
    })
  })

  grunt.registerTask('version', function(){
    var ver = grunt.option('ver');
    customizePackageJson({version: ver}, './app/package.json');
    
    function customizePackageJson(obj, path){
      var json = require(path);
      for(var i in obj){
        json[i] = obj[i];
      }
      fs.writeFileSync(path, JSON.stringify(json, null, 4));
    }
  });
  
  var buildFlow = ['nodewebkit'];
  if(isWin) buildFlow.push('copy:win');

  grunt.registerTask('buildapp', buildFlow);

  grunt.registerTask('default', 'test');
}