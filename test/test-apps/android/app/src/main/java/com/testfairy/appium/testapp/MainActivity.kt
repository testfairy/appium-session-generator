package com.testfairy.appium.testapp

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import kotlinx.android.synthetic.main.activity_main.*

class MainActivity : AppCompatActivity() {

	private val actionActivities = listOf(
		ContentDescriptionTest::class.java,
		DialogTest::class.java,
		EditTextTest::class.java,
		GesturesTest::class.java,
		ImageButtonTest::class.java,
		ScrollTest::class.java,
		ViewIdTest::class.java,
		XPathTest::class.java
	)

	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		setContentView(R.layout.activity_main)

		actions.adapter = object : BaseAdapter() {
			override fun getView(position: Int, convertView: View?, parent: ViewGroup?): View {
				var actionButton = if (convertView == null) {
					Button(this@MainActivity)
				} else {
					convertView as Button
				}

				actionButton.setOnClickListener {
					startActivity(getItem(position) as Intent)
				}

				actionButton.text = actionActivities[position].simpleName.replace("Test", " Test")
				actionButton.textSize = 22f
				actionButton.post {
					val layoutParams = actionButton.layoutParams

					layoutParams.height = 500

					actionButton.layoutParams = layoutParams
				}

				return actionButton
			}

			override fun getItem(position: Int): Any {
				return Intent(this@MainActivity, actionActivities[position])
			}

			override fun getItemId(position: Int): Long {
				return position.toLong()
			}

			override fun getCount(): Int {
				return actionActivities.size
			}
		}
	}
}
