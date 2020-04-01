/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict'

/*
 * Common code that is shared between content scripts and the background page
 */

function clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}
