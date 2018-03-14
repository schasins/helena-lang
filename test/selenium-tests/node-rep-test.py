# maria's command: C:/python27/python node-rep-test.py C:\Users\maria\Documents\chromedriver_win32\chromedriver

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
import time
from sys import platform
import sys
from multiprocessing import Process, Queue
import traceback
import logging
import random
import requests
import numpy as np
import os
import json


chromeDriverPath = sys.argv[1] 

unpackedExtensionPath = os.path.abspath("../../../../../.") #src folder
extensionkey = None

def newDriver():
	chrome_options = Options()
	driver = webdriver.Chrome(chromeDriverPath, chrome_options=chrome_options)
	return driver

def test(driver, testName):
	print testName

	testPath = "./node-rep-test-cases/" + testName + ".js"
	testScript = open(testPath, "r")

	#navigate to page, test script stores path as comment in first line
	firstLine = testScript.readline()
	sourcePath = firstLine.strip("/* \t\n\r")
	sourcePath = "file:///" + os.path.abspath("./sources") + "/" + sourcePath
	driver.get(sourcePath)

	#load NodeRep script
	nodeRepPath = "../../content/node_rep.js"
	driver.execute_script(open(nodeRepPath, "r").read())

	#run test script
	testResults = driver.execute_script(testScript.read())

	if testResults['passed']:
		print "passed"
	else:
		print "failed, returned: " + testResults['result'] + ", expected: " + testResults["expected"]

def main():
	driver = newDriver()

	test(driver, "textBasic")
	test(driver, "imgAltText")
	test(driver, "divImageNoAltText")

main()
