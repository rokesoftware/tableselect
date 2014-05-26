/**
 * @preserve
 * TableSelect - jQuery Plugin
 * Version: 0.1.0
 * Requires jQuery v2.0 or later
 *
 * Examples at http://tadeaspetak.net/roke/tableselect/
 * License: https://github.com/rokesoftware/tableselect/blob/master/License
 *
 * Copyright 2014 Roke Software - info@roke.cz
 *
 */

//make sure a number fits in certain boundaries
if (!Number.prototype.fitIn) {
	Number.prototype.fitIn = function(min, max) {
		var self = this;
		self = Math.max(self, min);
		self = Math.min(self, max);
		return self;
	};
}

(function($) {
	
	//scroll to the given element 
	$.fn.scrollTo = function() {
		if (this.size()) {
			var yScroll = $(document).scrollTop();
			var viewportHeight = window.innerHeight;
			var elTop = this.offset().top;
			var elHeight = this.outerHeight();
			
			//scroll up
			if (elTop + elHeight > yScroll + viewportHeight) {
				$(window).scrollTop(elTop + elHeight - viewportHeight);
			}
			//scroll down
			else if (elTop < yScroll) {
				$(window).scrollTop(elTop);
			}
		}
		return this;
	};

	$.widget('roke.tableselect', {
		options: {
			'selected': 'selected',
			'selectedExtra': 'info',
			'selectionStart': 'selection-start',
			'selectionEnd': 'selection-end',
			'ignore': '.table-select-ignore'
		},
		/**
		 * Constructor of the plugin.
		 * 
		 * @returns {undefined}
		 */
		_create: function() {
			this.$el = this.element;

			/** handle a click on a row */
			this._on(this.$el, {
				'mousedown': function(e) {
					//disable selection if shift is pressed
					if (e.shiftKey) {
						this.$el.disableSelection();
					}
				},
				'mouseup': function() {
					//re-enable selection
					this.$el.enableSelection();
				},
				'click tbody tr': function(e) {
					var $row = $(e.currentTarget);

					//row should be ignored
					if (this.getAll().filter($row).size() === 0) {
						return;
					}

					//ctrl pressed
					if (e.ctrlKey) {
						if (this.isSelected($row)) {
							this.unselect($row);
						} else {
							this.select($row, {asFirst: true, asLast: true});
						}
					}

					//shift pressed -> range selection
					else if (e.shiftKey) {
						this.selectRange(this.getAll().index(this.getSelectionStart(true)), this.getAll().index($row));
					}

					//no special key pressed
					else {
						// only this row is selected -> unselect
						if (this.isSelected($row) && this.getSelected().size() < 2) {
							this.unselect($row);
						}
						// select this row
						else {
							this.unselect(this.getSelected(), {followedBySelect: true});
							this.select($row, {asFirst: true});
						}
					}
				}
			});

			/** handle a keydown anywhere in a document */
			this._on($(document), {
				'keydown': function(e) {
					var focused = $(":focus").size();
					switch (e.which) {

						// **** UP ****
						case 38 :
							//do nothing if something focused
							if (focused) {
								return;
							}
							e.stopPropagation();
							e.preventDefault();

							// shift pressed
							if (e.shiftKey) {
								// no selection -> select the last row
								if (this.getSelected().size() === 0) {
									this.select(this.getAll().last(), {asFirst: true});
								}

								// range selection
								this.selectRange(this.getAll().index(this.getSelectionStart()), this.getAll().index(this.getSelectionEnd()) - 1);
							}
							// no shift
							else {
								var $selectionEnd = this.getSelectionEnd();
								this.unselect(this.getSelected(), {followedBySelect: true});

								//no selection or the first one is selected
								if ($selectionEnd.size() === 0 || this.getAll().index($selectionEnd) === 0) {
									this.select(this.getAll().last(), {asFirst: true});
								} else {
									this.select(this.previous($selectionEnd), {asFirst: true});
								}
							}
							break;

							// **** DOWN ****
						case 40 :
							//do nothing if something focused
							if (focused) {
								return;
							}
							e.stopPropagation();
							e.preventDefault();

							//range selection if shift is pressed
							if (e.shiftKey) {
								this.selectRange(this.getAll().index(this.getSelectionStart(true)), this.getAll().index(this.getSelectionEnd()) + 1);
							}
							//no shift
							else {
								var $selectionEnd = this.getSelectionEnd();
								this.unselect(this.getSelected(), {followedBySelect: true});

								// no selection or the last one selected -> select the first row
								if ($selectionEnd.size() === 0 || this.getAll().index($selectionEnd) >= this.getAll().size() - 1) {
									this.select(this.getAll().first(), {asFirst: true});
								} else {
									this.select(this.next($selectionEnd), {asFirst: true});
								}
							}
							break;

							// **** Ctrl + A ****
						case 65 :
							if (e.ctrlKey && !focused) {
								e.stopPropagation();
								e.preventDefault();

								this.select(this.getAll(), {all: true});
							}
							break;

							// **** ESC ****
						case 27 :
							if (focused) {
								return;
							}

							e.stopPropagation();
							e.preventDefault();

							this.unselect(this.getAll(), {all: true});
							break;
					}
				}
			});

			//scrolling
			this._on(this.$el,{
				'tableselectchange': function(){
					this.getSelectionEnd().scrollTo();
				}
			});
			
			//useful when initializing the plugin on a page
			this._trigger('change', {init: true});
		},
		/**
		 * Is the row selected?
		 * 
		 * @param {jQuery} $row
		 * @returns {boolean}
		 */
		isSelected: function($row) {
			return $row.hasClass(this.options.selected);
		},
		/**
		 * Unselect rows.
		 * 
		 * @param {jQuery} $rows
		 * @param {Object} options
		 * @returns {jQuery}
		 */
		unselect: function($rows, options) {
			options = $.extend({
				skipFirst: false,
				trigger: true,
				followedBySelect: false
			}, options);

			//skip first selected
			if (options.skipFirst) {
				$rows.filter("." + this.options.selectionStart).removeClass(this.options.selectionEnd);
				$rows = $rows.not("." + this.options.selectionStart);
			}

			//unselect given rows
			$rows.removeClass(this.options.selected).removeClass(this.options.selectedExtra).removeClass(this.options.selectionStart).removeClass(this.options.selectionEnd);

			if (options.trigger) {
				this._trigger('change', null, {
					rows: $rows,
					type: 'unselect',
					followedBySelect: options.followedBySelect
				});
			}

			return $rows;
		},
		/**
		 * Select rows.
		 * 
		 * @param {jQuery} $rows
		 * @param {Object} options
		 * @returns {jQuery}
		 */
		select: function($rows, options) {
			options = $.extend({
				asFirst: false,
				asLast: false,
				trigger: true
			}, options);

			// set as the selection start
			if (options.asFirst) {
				this.getAll().removeClass(this.options.selectionStart);
				$rows.addClass(this.options.selectionStart);
			}

			// set as the selection end
			if (options.asLast) {
				this.getAll().removeClass(this.options.selectionEnd);
				$rows.addClass(this.options.selectionEnd);
			}

			// select the row(s)
			$rows.addClass(this.options.selected).addClass(this.options.selectedExtra);

			// trigger
			if (options.trigger) {
				this._trigger('change', null, {
					rows: $rows,
					type: 'select'
				});
			}

			return $rows;
		},
		/**
		 * Select a range of rows.
		 * 
		 * @param {Number} start
		 * @param {Number} end
		 * @returns {undefined}
		 */
		selectRange: function(start, end) {
			var rowCount = this.getAll().size();
			start = start.fitIn(0, rowCount - 1);
			end = end.fitIn(0, rowCount - 1);

			// cancel any previous selection
			this.unselect(this.getSelected(), {
				skipFirst: true,
				followedBySelect: true
			});

			// selection
			var difference = end - start;
			if (difference > 0) {
				for (var i = start + 1; i <= end; i += 1) {
					this.select(this.getAll().eq(i), {trigger: false});
				}
			} else {
				for (var i = start - 1; i >= end; i -= 1) {
					this.select(this.getAll().eq(i), {trigger: false});
				}
			}

			//mark the last row as the selection end
			this.getAll().eq(end).addClass(this.options.selectionEnd);

			//trigger select
			this._trigger("change", null, {
				type: 'select',
				rows: this.getSelected()
			});
		},
		/**
		 * Get all the rows in the table (tbody).
		 * 
		 * @param {boolean} refresh Refresh the rows.
		 * @returns {jQuery}
		 */
		getAll: function(refresh) {
			if (!this.$all || refresh) {
				this.refresh();
			}
			return this.$all;
		},
		/**
		 * Refresh all the rows (e.g. after loading rows by AJAX).
		 * 
		 * @returns {undefined}
		 */
		refresh: function() {
			var $all = this.$el.find('tbody tr');
			//filter ignored
			if (typeof this.options.ignore === 'string') {
				$all = $all.not(this.options.ignore);
			}
			else if (typeof this.options.ignore === 'function') {
				$all = this.options.ignore.call(this, this, $all);
			}
			this.$all = $all;
		},
		/**
		 * 
		 * @returns {jQuery} Selected rows.
		 */
		getSelected: function() {
			return this.getAll().filter("." + this.options.selected);
		},
		/**
		 * Get the first row of the selection.
		 * 
		 * @param {Boolean} force
		 * @returns {jQuery}
		 */
		getSelectionStart: function(force) {
			force = force || false;
			var $start = this.getAll().filter('.' + this.options.selectionStart);
			if ($start.size() === 0 && force) {
				$start = this.select(this.getAll().eq(0), {asFirst: true});
			}
			return $start;
		},
		/**
		 * Get the last row of the selection.
		 * 
		 * @param {boolean} [force=false]
		 * @returns {jQuery} 
		 */
		getSelectionEnd: function(force) {
			force = force || false;
			var $end = this.getAll().filter('.' + this.options.selectionEnd);
			if ($end.size() === 0) {
				$end = this.getSelectionStart(force);
			}
			return $end;
		},
		/**
		 * Get the previous row (if any).
		 * 
		 * @param {jQuery} $row
		 * @returns {jQuery|Boolean}
		 */
		previous: function($row) {
			var $prev = this.getAll().eq(this.getAll().index($row) - 1);
			return $prev.size() ? $prev : false;
		},
		/**
		 * Get the next row (if any).
		 * 
		 * @param {jQuery} $row
		 * @returns {jQuery|Boolean}
		 */
		next: function($row) {
			var $next = this.getAll().eq(this.getAll().index($row) + 1);
			return $next.size() ? $next : false;
		}
	});
})(jQuery);