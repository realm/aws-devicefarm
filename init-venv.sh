#!/bin/sh

virtualenv sample-venv/
cd sample-venv/
source bin/activate
pip install pytest Appium-Python-Client
py.test --collect-only tests/
pip freeze > requirements.txt
zip -r ../test_bundle.zip tests/ requirements.txt
