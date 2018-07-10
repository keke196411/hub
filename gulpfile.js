/*引入gulp及相关插件 require('node_modules里对应模块')*/
var gulp = require('gulp'),
	//清楚文件
	clean = require('gulp-clean'),
	//编译less
	less = require('gulp-less'),
	//压缩css
	cssmin = require("gulp-minify-css"),
	//重命名
	rename = require('gulp-rename'),
	//压缩js
	uglify = require('gulp-uglify'),
	//多文件合并
	concat = require('gulp-concat'),
	//为文件名加MD5后缀
	////rev = require('gulp-rev'), 
	//储存位置信息
	sourcemaps = require('gulp-sourcemaps'),
	livereload = require('gulp-livereload');

//清除文件
gulp.task('clean', function(){
  return gulp.src(['dist/pages/**/*.html','dist/*.html','dist/css/*.css','dist/images/**/*.*','dist/js/**/*.*','!dist/**/*.svn'])
   .pipe(clean());
});
//编译less
gulp.task('less',['clean'], function () {
	//编译src目录下的所有less文件
    //除了reset.less和test.less（!src/less/**/{reset,test}.less）
	return gulp.src(['src/less/style.less'])
	.pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('src/css'))
});
//压缩css
gulp.task('cssmin', ['less'], function () {
	return gulp.src(['src/css/style.css'])
	.pipe(sourcemaps.init())
    .pipe(cssmin())
    .pipe(rename({extname: '.min.css' }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('src/css/'))
    .pipe(gulp.dest('dist/css/'))
});
//复制
gulp.task('copy',['cssmin'], function() {
	return gulp.src(['src/pages*/**','src/*.html','src/images*/**','src/vender*/**','src/js*/**','src/css*/*.css'])
    .pipe(gulp.dest('dist/'))
});
gulp.task('reload',['copy'],function(){
	gulp.src(['src/index.html']).pipe(livereload())
});
//监听
gulp.task('watch', function () {
	livereload.listen();
    return gulp.watch(['src/**/*.less','src/**/*.html','src/js/*.js'], ['default']);
});
gulp.task('default',['clean','less', 'cssmin','copy','reload']);