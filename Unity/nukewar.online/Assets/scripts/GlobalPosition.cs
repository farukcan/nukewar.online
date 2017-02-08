using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class GlobalPosition : object
{
    /// <summary>
    /// Enlem ; derece
    /// </summary>
    public float lat;

    /// <summary>
    /// Boylam ; derece
    /// </summary>
    public float lon;

    /// <summary>
    /// Yapılandırıcı
    /// </summary>
    /// <param name="la">Enlem</param>
    /// <param name="lo">Boylam</param>
    public GlobalPosition(float la, float lo)
    {
        lat = la;
        lon = lo;
    }


    /// <summary>
    /// Mevcut dünyanin çapıyla Vector3 çevir
    /// </summary>
    /// <returns></returns>
    public Vector3 toVector3()
    {
        return this.toVector3(World.radius);
    }

    /// <summary>
    /// Herhangi bir dünyanın çapıyla Vector3 e çevir
    /// </summary>
    /// <param name="r">Çap</param>
    /// <returns>3Boyutlu uzayda bir nokta</returns>
    public Vector3 toVector3(float r)
    {
        float a1 = Mathf.Deg2Rad * (lat-90 );
        float a2 = Mathf.Deg2Rad * (lon );

        float sin1 = Mathf.Sin(a1);
        float cos1 = Mathf.Cos(a1);
        float sin2 = Mathf.Sin(a2);
        float cos2 = Mathf.Cos(a2);
        return new Vector3(sin1 * cos2, cos1, sin1 * sin2) * r;
    }

    //-------OPERATORS--------------------------------
    //------------------------------------------------
    public static GlobalPosition operator +(GlobalPosition a, GlobalPosition b)
    {
        return new GlobalPosition(a.lat + b.lat, a.lon + b.lon);
    }

    //------------------------------------------------
    public static GlobalPosition operator -(GlobalPosition a, GlobalPosition b)
    {
        return new GlobalPosition(a.lat - b.lat, a.lon - b.lon);
    }

    //------------------------------------------------
    public static GlobalPosition operator *(GlobalPosition a, GlobalPosition b)
    {
        return new GlobalPosition(a.lat * b.lat, a.lon * b.lon);
    }

    //------------------------------------------------
    public static GlobalPosition operator /(GlobalPosition a, GlobalPosition b)
    {
        return new GlobalPosition(a.lat / b.lat, a.lon / b.lon);
    }
    //------------------------------------------------
    public static GlobalPosition operator +(GlobalPosition a, float b)
    {
        return new GlobalPosition(a.lat + b, a.lon + b);
    }

    //------------------------------------------------
    public static GlobalPosition operator -(GlobalPosition a, float b)
    {
        return new GlobalPosition(a.lat - b, a.lon - b);
    }

    //------------------------------------------------
    public static GlobalPosition operator *(GlobalPosition a, float b)
    {
        return new GlobalPosition(a.lat * b, a.lon * b);
    }

    //------------------------------------------------
    public static GlobalPosition operator /(GlobalPosition a, float b)
    {
        return new GlobalPosition(a.lat / b, a.lon / b);
    }
    //------------------------------------------------
    public override string ToString()
    {
        return "(Lat:" + lat + "_Lon:" + lon + ")";
    }
}
