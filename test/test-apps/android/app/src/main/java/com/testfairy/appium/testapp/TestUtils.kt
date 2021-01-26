package com.testfairy.appium.testapp

import android.R
import android.app.Activity
import android.app.AlertDialog

fun Activity.showAlert(msg: String, happy: Boolean = false, action: ()->Unit = {}) {

	val icon = if (happy) R.drawable.ic_secure else R.drawable.ic_delete

	AlertDialog.Builder(this)
		.setTitle("Alert")
		.setMessage(msg) // Specifying a listener allows you to take an action before dismissing the dialog.
		.setPositiveButton("OK") { dialog, which ->
			dialog.dismiss()
			action.invoke()
		}
		.setCancelable(false)
		.setIcon(icon)
		.show()
}
