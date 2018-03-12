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

# go import os and os.path.abspath(relPath), then add file:// thing

chromeDriverPath = sys.argv[1] 
#from pyvirtualdisplay import Display
#display = Display(visible=0, size=(800, 800))  
#display.start()

unpackedExtensionPath = os.path.abspath("../../../../../.") #src folder
extensionkey = None

def newDriver():
	chrome_options = Options()
	chrome_options.add_argument("--load-extension=" + unpackedExtensionPath)
	# chrome_options.add_argument("user-data-dir=profiles/" + profile)
	# chrome_options.add_argument("--display=:0") 

	driver = webdriver.Chrome(chromeDriverPath, chrome_options=chrome_options)

	driver.get("chrome://extensions/")
	checkbox = driver.find_element_by_id("toggle-dev-on")
	if (not checkbox.is_selected()):
		checkbox.click()
		time.sleep(1)

	elems = driver.find_elements_by_class_name("extension-details")
	for i in range(len(elems)):
		t = elems[i].text
		if ("Helena Scraper and Automator" in t):
			lines = t.split("\n")
			for line in lines:
				if "ID: " in line:
					key = line.strip().split("ID: ")[1]
					print "extension key:", key
					extensionkey = key

	#driver.get("chrome-extension://" + extensionkey + "/pages/mainpanel.html")
	return driver

def test(driver, testName):
	print testName

	testPath = "./node-rep-test-cases/" + testName + ".js"
	testScript = open(testPath, "r")

	#navigate to page, test script stores path as comment in first line
	firstLine = testScript.readline()
	sourcePath = firstLine[3:len(firstLine)-3] #after the commment
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
		print "failed, returned: " + testResults['result']

def main():
	driver = newDriver()

	test(driver, "textBasic")
	test(driver, "imgAltText")
	test(driver, "divImageNoAltText")

main()
