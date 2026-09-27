#!/usr/bin/env python3
"""Bestands-Naht am TAKT des Aufloesers: qi-master.de ist mit origin/main der DACH-Storefront
synchron -- gemessen gegen den Stand, den der Aufloeser schon haette nachziehen muessen.

WARUM ES DAS GIBT. Die Naht-Hypothese h0c0a7ffd (Job 20260926-qi-master-de-treppe-abgeloest-
wortlaut-ungedeckt-prio50) mass mit probe_bestand_naht.py --live LIVE gegen origin/main. Nach
jedem Upstream-Merge auf eine der abgeleiteten Quellen war sie bis ~24 h rot, bis der Aufloeser
(rt qi-master-bestand-aufloeser, taeglich 06:05Z) nachzog -- Belegfall a86ffa9 am 2026-09-26
19:36Z, 16 min spaeter rot, 10,6 h spaeter vom Aufloeser geheilt. Ein Faelligkeitstick zwischen
Merge und Aufloeser-Lauf haette einen Fehlalarm gegen gesunden Code ausgeloest. Die Frische
eines Spiegels ist nur am Takt seines Erneuerers messbar; diese Probe misst genau das.
probe_bestand_naht.py bleibt unveraendert (beurkundetes Messgeraet, Diagnose, rt-Wache).

DREI ARME, alle gegen den Stand U = BESTAND.json:upstream_commit:
  inhalt   jede abgeleitete Datei hier ist byte-gleich mit der Ableitung aus U (bestand.py,
           derselbe Code wie Nachzieher und Aufloeser), und BESTAND.json nennt ihren Hash.
           Rot = LOKAL-DRIFT/FEHLT/MANIFEST: hier hat jemand angefasst, kein Takt heilt das.
  takt     jeder Commit auf origin/main NACH U, der die Ableitung aendert, ist juenger als
           FRIST. Ein aelterer ist UEBERFRISTIG: der Aufloeser haette ihn ziehen muessen.
           Frische Drift wird genannt ("in Frist"), ist aber NICHT rot.
  rest     bestand.restbericht() ist leer: drueben gibt es keine qi-master-Datei, die weder
           abgeleitet noch benannt ausgenommen ist. Sofort rot -- das heilt kein Takt, dort ist
           eine Entscheidung faellig (Belegfall wortlaut.json, 22.09.).

FRIST 26 h wie probe_aufloeser_wirkung.py: taeglicher Lauf 06:05, dazu Build und rt-Slot.

EXIT 0 SYNCHRON AM TAKT (Marker "GRUEN:") | 1 BEFUND (Marker "ROT:") | 4 MESSAUSFALL (git/Quelle
nicht lesbar) -- nie gruen, nie Befund.

  probe_naht_takt.py [--kein-fetch]
Umlenkbar: QB_REPO/QB_REF (wie bestand.py), QM_NAHT_FRIST_H. Der Baum hier ist der, in dem
diese Datei liegt (bestand.STOREFRONT) -- fuer den Rot-Nachweis also eine Kopie des Moduls.
"""
import datetime as dt
import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bestand as B  # noqa: E402

FRIST_H = float(os.environ.get("QM_NAHT_FRIST_H", "26"))


def git(*a):
    r = subprocess.run(["git", "-C", B.QB_REPO, *a], capture_output=True, text=True, timeout=120)
    if r.returncode != 0:
        raise B.Messausfall(f"git {' '.join(a[:3])}: {r.stderr.strip()[:200]}")
    return r.stdout


def main(argv):
    befunde, in_frist = [], []
    try:
        if "--kein-fetch" not in argv:
            git("fetch", "-q", "origin")
        spitze = B.git_rev()
        mani_b = B.ist_lokal(os.path.relpath(B.MANIFEST, B.STOREFRONT))
        if mani_b is None:
            raise B.Messausfall("BESTAND.json fehlt")
        mani = json.loads(mani_b)
        u = mani["upstream_commit"]
        im_manifest = {e["lokal"]: e["sha256"] for e in mani.get("dateien", [])}

        # Arm inhalt: hier == Ableitung aus U
        soll = B.soll_ableiten(ref=u)
        for rel, b in sorted(soll.items()):
            ist = B.ist_lokal(rel)
            if ist is None:
                befunde.append(f"FEHLT: {rel}")
                continue
            if ist != b:
                befunde.append(f"LOKAL-DRIFT gegen BESTAND {u[:9]}: {rel}")
            if im_manifest.get(rel) != B.sha256(ist):
                befunde.append(f"MANIFEST: {rel} fehlt in BESTAND.json oder Hash stimmt nicht")

        # Arm takt: Ereignisse nach U, aelter als FRIST
        anc = subprocess.run(["git", "-C", B.QB_REPO, "merge-base", "--is-ancestor", u, spitze])
        if anc.returncode == 1:
            befunde.append(f"BESTAND zeigt auf {u[:9]}, der nicht in {B.QB_REF} liegt")
            ereignisse = []
        elif anc.returncode != 0:
            raise B.Messausfall(f"merge-base {u[:9]} {spitze[:9]}: rc={anc.returncode}")
        else:
            quellen = sorted(set(B.K1) | {B.FAQ_QUELLE, *B.STUDIEN_QUELLEN})
            roh = git("log", "--first-parent", "--format=%H %cI", f"{u}..{spitze}", "--", *quellen)
            ereignisse = []
            for z in roh.splitlines():
                if not z.strip():
                    continue
                c, t = z.split()
                if B.soll_ableiten(ref=c) != B.soll_ableiten(ref=f"{c}^"):
                    ereignisse.append((c, dt.datetime.fromisoformat(t).astimezone(dt.timezone.utc)))
        jetzt = dt.datetime.now(dt.timezone.utc)
        frist = dt.timedelta(hours=FRIST_H)
        for c, t in ereignisse:
            alter = (jetzt - t).total_seconds() / 3600
            if jetzt - t > frist:
                befunde.append(f"UEBERFRISTIG: {c[:9]} vom {t:%Y-%m-%d %H:%MZ} seit {alter:.1f} h "
                               f"nicht nachgezogen (Frist {FRIST_H:g} h)")
            else:
                in_frist.append(f"{c[:9]} ({alter:.1f} h alt, Aufloeser hat noch "
                                f"{FRIST_H - alter:.1f} h)")

        # Arm rest
        rest = B.restbericht()
        if rest:
            befunde.append(f"UNGEDECKT drueben: {rest}")
    except (B.Messausfall, ValueError, KeyError, subprocess.TimeoutExpired) as e:
        print(f"EXIT4 MESSAUSFALL: {e}")
        return 4

    print(f"BESTAND {u[:9]}, {B.QB_REF}={spitze[:9]}, Frist {FRIST_H:g} h: {len(soll)} Dateien, "
          f"{len(ereignisse)} Ereignis(se) nach dem Bestand, restbericht {len(rest)}")
    for z in in_frist:
        print(f"  in Frist  {z}")
    if befunde:
        print("ROT: " + " | ".join(befunde))
        return 1
    print("GRUEN: synchron am Takt des Aufloesers"
          + (" (frische Drift in Frist, kein Befund)" if in_frist else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
