/* gulp插件 */
var gulp = require('gulp'),
    sass = require('gulp-sass'), //编译scss
    autoprefixer = require('gulp-autoprefixer'), //自动添加前缀
    clean = require('gulp-clean-css'), //压缩css
    concat = require('gulp-concat'), //合并文件
    uglify = require('gulp-uglify'), //压缩js
    babel = require('gulp-babel'), //es6 ----> es5
    htmlmin = require('gulp-htmlmin'), //压缩html插件
    server = require('gulp-webserver'), //起服务
    rev = require('gulp-rev'), //给文件添加hash后缀
    collector = require('gulp-rev-collector'), //自动更改请求名
    imagesmin = require('gulp-imagemin'); //压缩图片


var url = require('url'),
    path = require('path'),
    fs = require('fs');


/* 开发环境 */

//编译css
gulp.task('devSass', function () {
    return gulp.src('./src/scss/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./src/css'))
})
//编译js
gulp.task('devJs', function () {
    return gulp.src('./src/js/**/*.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(gulp.dest('./src/babel'))
})
//监听
gulp.task('watch', function () {
    return gulp.watch(['./src/scss/**/*.scss', './src/babel/**/*.js'], gulp.series('devSass', 'devJs'))
})
//启服务
gulp.task('server', function () {
    return gulp.src('src')
        .pipe(server({
            // open: true, //自动开启
            livereload: true, //自动刷新
            middleware: function (req, res, next) { //前端拦截
                var pathname = url.parse(req.url).pathname;
                if (pathname === '/favicon.ico') {
                    return res.end('')
                } else {
                    pathname = pathname === '/' ? 'index.html' : pathname;
                    res.end(fs.readFileSync(path.join(__dirname, 'src', pathname)))
                }

            }
        }))
})
//默认执行
gulp.task('default', gulp.series('devSass', 'devJs', 'server', 'watch'))
/* -----------------------分割线----------------------------- */

//压缩html
gulp.task('bHtml', function () {
    return gulp.src(['./rev/rev-manifest.json', './src/**/*.html'])
        .pipe(htmlmin())
        .pipe(collector({
            replaceReved: true,
        }))
        .pipe(gulp.dest('./dist'))
})
//压缩css
gulp.task('bCss', function () {
    return gulp.src('./src/css/**/*.css')
        .pipe(clean())
        .pipe(gulp.dest('./dist/css'))
})
//压缩js
gulp.task('bJs', function () {
    return gulp.src('./src/babel/**/*.js')
        .pipe(rev())
        .pipe(uglify()) //压缩js
        .pipe(gulp.dest('./dist/js/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev'))
})
//压缩img
gulp.task('bImages', function () {
    return gulp.src('./src/images/*')
        .pipe(imagesmin())
        .pipe(gulp.dest('./dist/images'))
})

//打包执行
gulp.task('bulid', gulp.parallel('bCss', 'bJs','bHtml', 'bImages'))