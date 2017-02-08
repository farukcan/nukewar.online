using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Control : MonoBehaviour {

    GlobalPosition camera_pos = new GlobalPosition(0, 0);
    float sens = 0.2f;
    float zoom = 2;
    float zoomSens = 0.01f;
	// Use this for initialization
	void Start () {
		
	}
	
	// Update is called once per frame
	void Update () {
        transform.LookAt(Vector3.zero);
        transform.position = Vector3.Lerp(transform.position, camera_pos.toVector3(zoom),Time.deltaTime);
        if (Input.touchCount > 0 && Input.GetTouch(0).phase == TouchPhase.Moved)
        {
            if (Input.touchCount == 1)
            {
                //transform.Translate(new Vector3(Input.GetTouch(0).deltaPosition.x, Input.GetTouch(0).deltaPosition.y,0)*Time.deltaTime);
                camera_pos.lat -= Input.GetTouch(0).deltaPosition.y * sens;
                camera_pos.lon -= Input.GetTouch(0).deltaPosition.x * sens;
            }
            else if(Input.touchCount == 2)
            {
                Touch touchZero = Input.GetTouch(0);
                Touch touchOne = Input.GetTouch(1);

                Vector2 touchZeroPrevPos = touchZero.position - touchZero.deltaPosition;
                Vector2 touchOnePrevPos = touchOne.position - touchOne.deltaPosition;

                float prevTouchDeltaMag = (touchZeroPrevPos - touchOnePrevPos).magnitude;
                float touchDeltaMag = (touchZero.position - touchOne.position).magnitude;

                float deltaMagnitudeDiff = prevTouchDeltaMag - touchDeltaMag;
                zoom += deltaMagnitudeDiff* zoomSens;
                zoom = Mathf.Clamp(zoom, 0.5f, 20);

            }


        }
    }
}
