var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpIf = require('gulp-if');
var stream = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var browserify = require('browserify');
var del = require('del');
var babelify = require('babelify');
var concat = require('gulp-concat');
var minify = require('gulp-uglifyes');
var path = require('path');

// react version choise also depends on NODE_ENV === 'production'
var isDistBuild = process.env.NODE_ENV === 'production';
var BUILD_DIR = isDistBuild ? 'dist-build' : 'dev-build';

function bundle(path, insertSourceMaps) {
	return browserify({ entries: path, debug: insertSourceMaps })
		.transform(babelify, { presets: ['react'] })
		.bundle()
		.on('error', err => {
			gutil.log("Browserify Error", gutil.colors.red(err.message))
		})
		.pipe(stream('out.js'))
		.pipe(buffer());
}

///////////////////////////////////////////////////////////
// build test
///////////////////////////////////////////////////////////

gulp.task('build-test', function(cb) {
	runSequence('build-test-clean', 
		['build-test-js', 'built-test-html'], cb);
});

gulp.task('build-test-clean', function() {
	return del('test-build'); 
});

gulp.task('build-test-js', function() {
	return bundle('test/main.spec.js', false)
		.pipe(rename('main.spec.js'))
		.pipe(gulp.dest('test-build'));
});

gulp.task('built-test-html', function() {
	return gulp.src('test/runner.html')
		.pipe(gulp.dest('test-build'));
});

///////////////////////////////////////////////////////////
// build dev || dist
///////////////////////////////////////////////////////////

gulp.task('build', function(cb) {

	runSequence(
		'build-clean',
		[
			'build-manifest', 
			'build-background', 
			'build-content-js',
			'build-content-css',
			'build-popup-js',
			'build-popup-html',
			'build-popup-css',
			'build-fonts'
		], cb);
});

gulp.task('build-clean', function() {
	return del(BUILD_DIR); 
});

gulp.task('build-manifest', function() {
	return gulp.src('src/manifest.json')
		.pipe(gulp.dest(BUILD_DIR));
});

gulp.task('build-background', function() {
	return bundle('src/background/init.js', !isDistBuild)
		.pipe(gulpIf(isDistBuild, minify()))
		.pipe(rename('background.js'))
		.pipe(gulp.dest(path.join(BUILD_DIR, 'background')));
});

gulp.task('build-content-js', function() {
	return bundle('src/content/init.js', !isDistBuild)
		.pipe(gulpIf(isDistBuild, minify()))
		.pipe(rename('content.js'))
		.pipe(gulp.dest(path.join(BUILD_DIR, 'content')));
});

gulp.task('build-content-css', function() {
	return gulp.src([ // order matters
			'src/common/fonts.css',
			'src/content/gloss.css', 
			'src/common/faces.css'
		])
		.pipe(concat('content.css'))
		.pipe(gulp.dest(path.join(BUILD_DIR, 'content')));
});

gulp.task('build-popup-js', function() {
	return bundle('src/popup/init.js', !isDistBuild)
		.pipe(gulpIf(isDistBuild, minify()))
		.pipe(rename('popup.js'))
		.pipe(gulp.dest(path.join(BUILD_DIR, 'popup')));
});

gulp.task('build-popup-html', function() {
	return gulp.src('src/popup/popup.html')
		.pipe(rename('popup.html'))
		.pipe(gulp.dest(path.join(BUILD_DIR, 'popup')));
});

gulp.task('build-popup-css', function() {
	return gulp.src([ // order matters
			'src/common/fonts.css', 
			'src/popup/menu.css', 
			'src/common/faces.css',
		])
		.pipe(concat('popup.css'))
		.pipe(gulp.dest(path.join(BUILD_DIR, 'popup')));
});

gulp.task('build-fonts', function() {
	return gulp.src([
			'node_modules/roboto-fontface/fonts/roboto/Roboto-Regular.woff',
			'node_modules/roboto-fontface/fonts/roboto/Roboto-Medium.woff'
		])
		.pipe(gulp.dest(path.join(BUILD_DIR, 'fonts')));
});


///////////////////////////////////////////////////////////
// default
///////////////////////////////////////////////////////////

gulp.task('default', ['build'], function() {
	gulp.watch('src/**/*', ['build']);
	//gulp.watch('test/**/*', ['build-test']);
});

