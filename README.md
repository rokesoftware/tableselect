# TableSelect plugin

A jQuery plugin implementing table rows selection by mouse and keyboard comfortably.

## Usage

Use *up and down arrows* to move around the table, *hold shift* in case you want to
select a certain range of rows. A *simple click* with the mouse selects an individual
row, *holding ctrl adds the row* to the current selection (or removes if it is already
present). *Clicking while holding shift* selects ranges of rows in the typical way.

It is a typical jQuery plugin built using the [Widget Factoy](http://api.jqueryui.com/jquery.widget/),
use it as such. On any selection change, 'tableselectchange' event is fired with some additional
data that can be used to implement a variety of things. See the
[simple demo](http://tadeaspetak.net/roke/tableselect/simple.html) for the basic usage and the
[groups demo](http://tadeaspetak.net/roke/tableselect/groups.html) for something a bit more sophisticated.

## Dependencies

It is a jQuery plugin so you need [jQuery](http://code.jquery.com/) and
[jQuery UI (widget at least)](http://code.jquery.com/ui/). Use the latest versions
possible, please.

It looks good with [Bootstrap](http://getbootstrap.com) or any other CSS framework.
