# TableSelect

A jQuery plugin implementing table rows selection by mouse and keyboard comfortably.

## Why?

Of course, there are plugins implementing the same kind of functionality as this one.
But we needed something fairly light, mimicking the interface of Windows Explorer as much as possible
with all the
useful events fired... and writing it seemed easier (and more fun!) than bending anybody else's work.

## Usage

It is a typical jQuery plugin built using the [Widget Factoy](http://api.jqueryui.com/jquery.widget/),
use it as such. On any selection change, **select** or **unselect** events are fired with some additional
data that can be used to implement a variety of things. See the
[simple demo](http://roke.tadeaspetak.net/tableselect/demo/simple.html) for the basic usage and the
[groups demo](http://roke.tadeaspetak.net/tableselect/demo/groups.html) for something a bit more sophisticated.

## Dependencies

It is a jQuery plugin so you need [jQuery](http://code.jquery.com/) and
[jQuery UI (widget at least)](http://code.jquery.com/ui/).