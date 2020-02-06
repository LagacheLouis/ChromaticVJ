// options
var nameTheme = "src";
var proxy = "http://localhost:3000/src/";

var gulp = require("gulp");

//JS
var rename = require("gulp-rename");
var concat = require("gulp-concat");

// modules ES6
var browserify = require("browserify");
var babelify = require("babelify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var sourcemaps = require("gulp-sourcemaps");
var util = require("gulp-util");
var terser = require("gulp-terser");

//SASS
var sass = require("gulp-sass");
sass.compiler = require("node-sass");
var autoprefixer = require("gulp-autoprefixer");
var cleanCSS = require("gulp-clean-css");

//BROWSER SYNC
var browserSync = require("browser-sync");

var js_destination = nameTheme + "/assets/dist/js",
	jsVendorPath = nameTheme + "/assets/js/lib/",
	jsPath = nameTheme + "/assets/js/",
	jsVendorList = [
		jsVendorPath + 'curtains.min.js',
	];

// Compile sass into CSS, prefix it & auto-inject into browsers
gulp.task("sass", function() {
	return gulp
		.src(nameTheme + "/assets/scss/**/*.scss")
		.pipe(sass().on("error", sass.logError))
		.pipe(autoprefixer())
		.pipe(cleanCSS({ compatibility: "ie8" }))
		.pipe(gulp.dest(nameTheme + "/assets/css"))
		.pipe(browserSync.stream());
});

// Task to minify libs
gulp.task("vendorjs", function() {
	// Vendors
	gulp
		.src(jsVendorList)
		.pipe(concat("lib.js"))
		.pipe(gulp.dest(js_destination))
		.pipe(rename("lib.min.js"))
		.pipe(terser())
		.on("error", function(err) {
			console.error("Error!", err.message);
		})
		.pipe(gulp.dest(js_destination));
});

// Bundle
gulp.task("bundle", function() {
	var b = browserify({
		entries: jsPath + "app.js",
		debug: true,
		transform: [
			babelify.configure({
				presets: ["@babel/preset-env"]
			})
		]
	});

	return (
		b
			.bundle()
			.pipe(source("app.js"))
			.pipe(buffer())
			.pipe(sourcemaps.init({ loadMaps: true }))
			// Add other gulp transformations (eg. terser) to the pipeline here.
			.pipe(rename("bundle.js"))
			.pipe(gulp.dest(js_destination))
			.pipe(terser())
			.pipe(rename("bundle.min.js"))
			.pipe(gulp.dest(js_destination))
	);
});

//Build
gulp.task("build", ["vendorjs", "bundle", "sass"], function() {
	gulp
		.src([js_destination + "/lib.min.js", js_destination + "/bundle.min.js"])
		.pipe(concat("site.js"))
		.on("error", function(err) {
			console.error("Error!", err.message);
		})
		.pipe(gulp.dest(js_destination));
});

// Static Server + watching scss/html/js/json files
gulp.task("serve", ["sass"], function() {
	browserSync({
		proxy: proxy
	});
	gulp.watch(nameTheme + "/assets/scss/*.scss", ["sass"]);
	gulp.watch(nameTheme + "/assets/scss/part/*.scss", ["sass"]);
	gulp.watch(nameTheme + "/assets/js/**/*.js", ['bundle']);
	gulp.watch(nameTheme + "/assets/js/**/*.js").on("change", browserSync.reload);

	gulp.watch(nameTheme + "/*.php").on("change", browserSync.reload);
	gulp.watch(nameTheme + "/templates/*.php").on("change", browserSync.reload);
});

gulp.task("default", ["serve"]);
