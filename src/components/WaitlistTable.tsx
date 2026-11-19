import type { WaitlistEntryView } from '../services/api';

interface Props {
  entries: WaitlistEntryView[];
  onNotify: (entry: WaitlistEntryView) => void;
}

export function WaitlistTable({ entries, onNotify }: Props) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Phone</th>
            <th scope="col">Status</th>
            <th scope="col">Joined</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td>{e.position}</td>
              <td>{e.student.name}</td>
              <td>{e.student.phone}</td>
              <td>
                <span className={`badge badge-${e.status}`}>{e.status}</span>
              </td>
              <td>{new Date(e.joinedAt).toLocaleDateString()}</td>
              <td>
                <button
                  type="button"
                  className="btn btn-secondary"
                  aria-label={`Notify ${e.student.name} via SMS`}
                  onClick={() => onNotify(e)}
                >
                  Notify
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}