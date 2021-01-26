package com.testfairy.appium.testapp

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle

class DialogTest : AppCompatActivity() {

	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		setContentView(R.layout.activity_dialog_test)
	}

	override fun onResume() {
		super.onResume()

		showAlert("If this dialog doesn't go away in a few seconds, then something is wrong", true) {
			finish()
		}
	}
}
