
/* REQUIRE */

const _ = require ( 'lodash' ),
      gulp = require ( 'gulp' ),
      bytediff = require ( 'gulp-bytediff' ),
      flatten = require ( 'gulp-flatten' ),
      gulpif = require ( 'gulp-if' ),
      newer = require ( 'gulp-newer' ),
      plumber = require ( 'gulp-plumber' ),
      changed = require ( '../../utilities/changed' ),
      gutil = require ( '../../utilities/gutil' ),
      input = require ( '../../utilities/paths/input' ),
      output = require ( '../../utilities/paths/output' ),
      plumberU = require ( '../../utilities/plumber' ),
      components = require ( '../../plugins/components' ),
      dependencies = require ( '../../plugins/dependencies' ),
      touch = require ( '../../plugins/touch' ),
      project = require ( '../../project' ),
      {plugins} = project;

/* TASK */

function task () {

  const needUpdate = changed.environment () || changed.target () || changed.plugins ( 'dependencies', 'imagemin' ),
        needOutput = output.isEnabled ( 'images' );

  return gulp.src ( input.getPath ( 'images' ) )
             .pipe ( plumber ( plumberU.error ) )
             .pipe ( gulpif ( plugins.components.enabled, components ( _.merge ( { components: project.components }, plugins.components.options ) ) ) )
             .pipe ( gulpif ( plugins.dependencies.enabled, dependencies ( plugins.dependencies.options ) ) )
             .pipe ( flatten () )
             .pipe ( gulpif ( !needUpdate && needOutput, () => newer ( output.getDir ( 'images' ) ) ) )
             .pipe ( gulpif ( plugins.imagemin.enabled, bytediff.start () ) )
             .pipe ( gulpif ( plugins.imagemin.enabled, () => require ( 'gulp-imagemin' )( plugins.imagemin.plugins (), plugins.imagemin.options ) ) )
             .pipe ( gulpif ( plugins.imagemin.enabled, bytediff.stop () ) )
             .pipe ( gulpif ( needOutput, () => gulp.dest ( output.getDir ( 'images' ) ) ) )
             .pipe ( gulpif ( needOutput, touch () ) );

}

/* EXPORT */

module.exports = gutil.task.enhance ( task, 'build-images', 'Build images', 'more' );
